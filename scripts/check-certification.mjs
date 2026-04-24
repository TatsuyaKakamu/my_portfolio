import { writeJson, readJson } from './lib.mjs';

const base = await readJson('data/normalized/certifications.json', { certifications: [] });
const cert = base.certifications[0];
if (!cert) throw new Error('certifications.json が空です。');

const response = await fetch(cert.verificationUrl);
if (!response.ok) throw new Error(`Certification page fetch failed: ${response.status}`);
const text = await response.text();
const listed = text.includes(cert.holderName) || text.includes(cert.certificationId);

const updated = {
  certifications: base.certifications.map((item) => ({
    ...item,
    verificationStatus: listed ? 'listed' : 'not-found',
    lastCheckedAt: new Date().toISOString()
  }))
};

await writeJson('data/normalized/certifications.json', updated);
console.log(`[certification] status=${updated.certifications[0].verificationStatus}`);
