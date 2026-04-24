import { spawn } from 'node:child_process';

const jobs = [
  'scripts/fetch-github.mjs',
  'scripts/fetch-strava.mjs',
  'scripts/check-certification.mjs'
];

for (const job of jobs) {
  await new Promise((resolve, reject) => {
    const cp = spawn(process.execPath, [job], { stdio: 'inherit' });
    cp.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${job} exited with ${code}`))));
  });
}
