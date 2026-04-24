#!/usr/bin/env node
// Low-frequency check: verify that the TÜV SÜD certification page still lists
// the holder's name or certification ID. We only fetch the HTML, inspect it
// in-memory, and update a lightweight verification status field. We do not
// re-host the page or scrape additional personal data.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(
  __dirname,
  "..",
  "src",
  "data",
  "certifications.json",
);

async function checkPage(url, needles) {
  const res = await fetch(url, {
    headers: { "User-Agent": "portfolio-verification-check" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const html = await res.text();
  return needles.every((needle) => html.includes(needle));
}

async function main() {
  const existing = JSON.parse(await readFile(DATA_PATH, "utf8"));
  const now = new Date().toISOString();

  const updated = await Promise.all(
    existing.certifications.map(async (cert) => {
      if (!cert.verificationUrl) return cert;
      try {
        const needles = [cert.certificationId, cert.holderName].filter(Boolean);
        const listed = await checkPage(cert.verificationUrl, needles);
        return {
          ...cert,
          verificationStatus: listed ? "listed" : "not-found",
          lastCheckedAt: now,
        };
      } catch (err) {
        console.error(
          `[sync-certifications] ${cert.name} check failed:`,
          err.message,
        );
        return { ...cert, lastCheckedAt: now };
      }
    }),
  );

  const output = { ...existing, certifications: updated };
  await writeFile(DATA_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log("[sync-certifications] updated verification status");
}

main().catch((err) => {
  console.error("[sync-certifications] unexpected error:", err);
  process.exit(0);
});
