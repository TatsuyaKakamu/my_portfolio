#!/usr/bin/env python3
"""Fetch Garmin Connect activities and emit minimal records as JSON.

Authenticates with a pre-minted session token store (no password, no MFA prompt)
and writes an array of
    { "moving_time": <int seconds>, "start_date_local": "YYYY-MM-DDTHH:MM:SS" }
to --out (default scripts/.cache/activities.json). The Node aggregation scripts
(training-bootstrap.mjs / training-update-monthly.mjs) consume this file, so the
existing JST / streak / six-month-bucket math is reused unchanged.

Token source (the account keeps two-factor auth enabled; the token is minted
once with scripts/garmin_login.py):
  - CI: GARMIN_TOKEN_STORE_B64 — base64 of a tar.gz of the token directory.
  - Local: GARMINTOKENS — path to the token directory (default ~/.garminconnect).

Usage:
    GARMIN_TOKEN_STORE_B64=... python scripts/garmin_fetch.py        # CI
    GARMINTOKENS=~/.garminconnect python scripts/garmin_fetch.py     # local

This uses the unofficial python-garminconnect library, which talks to Garmin's
private endpoints and can break when Garmin changes them. Failures exit non-zero
so the workflow stops before overwriting training-data.json with bad data.
"""

import argparse
import base64
import datetime as dt
import io
import json
import os
import sys
import tarfile
import tempfile

try:
    from garminconnect import Garmin
except ImportError:
    sys.stderr.write(
        "[garmin] garminconnect not installed; run: "
        "pip install -r scripts/requirements.txt\n"
    )
    sys.exit(1)

DEFAULT_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "activities.json")


def resolve_tokenstore() -> str:
    """Return a token-store directory, materializing it from the base64 secret
    if GARMIN_TOKEN_STORE_B64 is set, otherwise using GARMINTOKENS."""
    blob = os.environ.get("GARMIN_TOKEN_STORE_B64")
    if blob:
        try:
            data = base64.b64decode(blob)
            tokenstore = tempfile.mkdtemp(prefix="garmin-tokens-")
            with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
                tar.extractall(tokenstore, filter="data")  # Python 3.12+
            return tokenstore
        except Exception as err:  # noqa: BLE001
            sys.stderr.write(f"[garmin] failed to read GARMIN_TOKEN_STORE_B64: {err}\n")
            sys.exit(1)
    tokenstore = os.environ.get("GARMINTOKENS")
    if tokenstore:
        return os.path.expanduser(tokenstore)
    sys.stderr.write(
        "[garmin] no token store: set GARMIN_TOKEN_STORE_B64 (CI) or GARMINTOKENS (local).\n"
        "Run `python scripts/garmin_login.py` once to mint a token.\n"
    )
    sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Garmin activities as minimal JSON records.")
    parser.add_argument("--out", default=DEFAULT_OUT, help="output JSON path")
    parser.add_argument(
        "--start",
        default="2010-01-01",
        help="earliest activity date to fetch (YYYY-MM-DD); full history is needed for streak math",
    )
    args = parser.parse_args()

    tokenstore = resolve_tokenstore()
    try:
        client = Garmin()
        client.login(tokenstore)
    except Exception as err:  # noqa: BLE001 - surface any auth/library failure
        sys.stderr.write(
            f"[garmin] token login failed: {err}\n"
            "The session may have expired; re-run `python scripts/garmin_login.py` "
            "and update the GARMIN_TOKEN_STORE_B64 secret.\n"
        )
        sys.exit(1)

    end = dt.date.today().isoformat()
    try:
        activities = client.get_activities_by_date(args.start, end)
    except Exception as err:  # noqa: BLE001
        sys.stderr.write(f"[garmin] activity fetch failed: {err}\n")
        sys.exit(1)

    records = []
    for activity in activities:
        # movingDuration is the closest analogue to Strava's moving_time. Some
        # activity types omit it, so fall back to total duration.
        moving = activity.get("movingDuration")
        if moving is None:
            moving = activity.get("duration")
        local = activity.get("startTimeLocal")  # "YYYY-MM-DD HH:MM:SS" (device local)
        if moving is None or not local:
            continue
        # Normalize to the "T"-separated form the Node aggregation parser expects.
        local = local.replace(" ", "T")
        records.append(
            {"moving_time": int(round(float(moving))), "start_date_local": local}
        )

    out_dir = os.path.dirname(args.out)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(records, handle, ensure_ascii=False)

    sys.stderr.write(f"[garmin] wrote {len(records)} activities to {args.out}\n")
    if not records:
        # An empty result is almost certainly an auth/library problem, not a real
        # "no activities" state for this account. Fail so we don't zero out data.
        sys.stderr.write("[garmin] no activities returned; treating as failure\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
