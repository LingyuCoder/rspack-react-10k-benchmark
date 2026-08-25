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
  const config = createRspackSharedConfig('2.0.0-rc.3');
  assert.deepEqual(config.experiments, { css: false });
  assert.equal(config.lazyCompilation, true);
  assert.deepEqual(config.cache, { type: 'memory' });
});

test('Rspack 1.x persistent cache stays under experiments.cache', () => {
  const config = createRspackSharedConfig('1.7.11', 'persistent');
  assert.equal(config.cache, true);
  assert.equal(config.lazyCompilation, undefined);
  assert.equal(config.experiments.css, true);
  assert.equal(config.experiments.lazyCompilation, true);
  assert.deepEqual(config.experiments.cache.type, 'persistent');
  assert.equal(config.experiments.cache.version, '1.7.11-persistent');
  assert.match(config.experiments.cache.buildDependencies[0], /rspack-shared-config\.mjs$/);
});

test('Rspack 2.x persistent cache moves to top-level cache config', () => {
  const config = createRspackSharedConfig('2.0.0-rc.3', 'persistent');
  assert.deepEqual(config.experiments, { css: false });
  assert.equal(config.lazyCompilation, true);
  assert.deepEqual(config.cache.type, 'persistent');
  assert.equal(config.cache.version, '2.0.0-rc.3-persistent');
  assert.match(config.cache.buildDependencies[0], /rspack-shared-config\.mjs$/);
});
