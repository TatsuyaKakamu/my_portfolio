#!/usr/bin/env python3
"""Fetch Garmin Connect activities and emit minimal records as JSON.

Logs in with GARMIN_EMAIL / GARMIN_PASSWORD (two-factor auth must be OFF so the
login can run unattended in CI) and writes an array of
    { "moving_time": <int seconds>, "start_date_local": "YYYY-MM-DDTHH:MM:SS" }
to --out (default scripts/.cache/activities.json). The Node aggregation scripts
(training-bootstrap.mjs / training-update-monthly.mjs) consume this file, so the
existing JST / streak / six-month-bucket math is reused unchanged.

Usage:
    GARMIN_EMAIL=... GARMIN_PASSWORD=... python scripts/garmin_fetch.py

This uses the unofficial python-garminconnect library, which talks to Garmin's
private endpoints and can break when Garmin changes them. Failures exit non-zero
so the workflow stops before overwriting training-data.json with bad data.
"""

import argparse
import datetime as dt
import json
import os
import sys

try:
    from garminconnect import Garmin
except ImportError:
    sys.stderr.write(
        "[garmin] garminconnect not installed; run: "
        "pip install -r scripts/requirements.txt\n"
    )
    sys.exit(1)

DEFAULT_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "activities.json")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch Garmin activities as minimal JSON records.")
    parser.add_argument("--out", default=DEFAULT_OUT, help="output JSON path")
    parser.add_argument(
        "--start",
        default="2010-01-01",
        help="earliest activity date to fetch (YYYY-MM-DD); full history is needed for streak math",
    )
    args = parser.parse_args()

    email = os.environ.get("GARMIN_EMAIL")
    password = os.environ.get("GARMIN_PASSWORD")
    if not email or not password:
        sys.stderr.write("[garmin] missing GARMIN_EMAIL / GARMIN_PASSWORD\n")
        sys.exit(1)

    try:
        client = Garmin(email=email, password=password)
        client.login()
    except Exception as err:  # noqa: BLE001 - surface any auth/library failure
        sys.stderr.write(f"[garmin] login failed: {err}\n")
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
