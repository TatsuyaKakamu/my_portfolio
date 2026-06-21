#!/usr/bin/env python3
"""One-time local login to mint a reusable Garmin Connect token store.

Run this ONCE on your own machine (not in CI). It logs in with your Garmin
email/password, prompts for the two-factor (MFA) one-time code, saves the
session token store, and prints a base64 blob to paste into the GitHub Secret
GARMIN_TOKEN_STORE_B64. The monthly workflow then authenticates with that token
only — no password, no MFA prompt.

The session auto-refreshes indefinitely while its refresh token is valid
(roughly a year). When it finally expires, re-run this script and update the
secret. Two-factor auth can stay enabled on the account the whole time.

Usage:
    pip install -r scripts/requirements.txt
    python scripts/garmin_login.py
"""

import base64
import getpass
import io
import os
import sys
import tarfile

try:
    from garminconnect import Garmin
except ImportError:
    sys.stderr.write(
        "[garmin] garminconnect not installed; run: "
        "pip install -r scripts/requirements.txt\n"
    )
    sys.exit(1)

# Same default the fetch script reads locally, so a local bootstrap can reuse it.
TOKENSTORE = os.environ.get("GARMINTOKENS") or os.path.expanduser("~/.garminconnect")


def main() -> None:
    email = os.environ.get("GARMIN_EMAIL") or input("Garmin email: ").strip()
    password = os.environ.get("GARMIN_PASSWORD") or getpass.getpass("Garmin password: ")

    try:
        client = Garmin(
            email=email,
            password=password,
            prompt_mfa=lambda: input("MFA code: ").strip(),
        )
        client.login()
    except Exception as err:  # noqa: BLE001 - surface any auth/library failure
        sys.stderr.write(f"[garmin] login failed: {err}\n")
        sys.exit(1)

    os.makedirs(TOKENSTORE, exist_ok=True)
    client.garth.dump(TOKENSTORE)

    # Pack the whole token directory into one base64 tar.gz so it fits in a
    # single GitHub Secret regardless of how many files garth writes.
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        tar.add(TOKENSTORE, arcname=".")
    blob = base64.b64encode(buf.getvalue()).decode("ascii")

    sys.stderr.write(f"\n[garmin] login OK; tokens saved to {TOKENSTORE}\n")
    sys.stderr.write(
        "[garmin] Add the line below as GitHub Secret GARMIN_TOKEN_STORE_B64:\n\n"
    )
    # The blob goes to stdout so it can be piped/redirected cleanly.
    print(blob)


if __name__ == "__main__":
    main()
