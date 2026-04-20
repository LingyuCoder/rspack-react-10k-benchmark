import test from 'node:test';
import assert from 'node:assert/strict';

import { createRspackSharedConfig } from './rspack-shared-config.mjs';

test('Rspack 1.x keeps lazyCompilation under experiments', () => {
  const config = createRspackSharedConfig('1.7.11');
  assert.deepEqual(config.experiments, {
    css: true,
    lazyCompilation: true,
  });
  assert.equal(config.lazyCompilation, undefined);
  assert.equal(config.cache, true);
});

test('Rspack 2.x moves lazyCompilation to the top level', () => {
  const config = createRspackSharedConfig('2.0.0-rc.2');
  assert.deepEqual(config.experiments, { css: false });
  assert.equal(config.lazyCompilation, true);
  assert.deepEqual(config.cache, { type: 'memory' });
});
