import test from 'node:test';
import assert from 'node:assert/strict';

import { getPuppeteerLaunchOptions } from './puppeteer-launch-options.mjs';

test('linux CI disables sandbox for Puppeteer', () => {
  assert.deepEqual(
    getPuppeteerLaunchOptions({ platform: 'linux', ci: true }),
    { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  );
});

test('non-linux or non-CI keeps default launch options', () => {
  assert.deepEqual(getPuppeteerLaunchOptions({ platform: 'darwin', ci: true }), {});
  assert.deepEqual(getPuppeteerLaunchOptions({ platform: 'linux', ci: false }), {});
});
