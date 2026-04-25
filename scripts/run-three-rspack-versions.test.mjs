import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BENCHMARK_RUN_TIMES,
  DEFAULT_BENCHMARK_WARMUP_TIMES,
  DEFAULT_SAMPLES_PER_VERSION,
  createDevDependencySetArgs,
  createSetVersionInstallCommand,
  parseRunMetrics,
} from './run-three-rspack-versions.mjs';
import { SCENARIO_MATRIX, VERSION_MATRIX } from './version-config.mjs';

const SAMPLE_STDOUT = `
Build metrics:

| Name | Build (no cache) | Memory (RSS) | Output size | Gzipped size |
| --- | --- | --- | --- | --- |
| Rspack CLI 3.0.0 | 2030ms | 900MB | 5934.3kB | 1368.1kB |

Development metrics:

| Name | Startup (no cache) | Startup (with cache) | HMR | Memory (RSS) |
| --- | --- | --- | --- | --- |
| Rspack CLI 3.0.0 | 1000ms | 800ms | 93ms | 350MB |
`;

const PERSISTENT_SAMPLE_STDOUT = `
Build metrics:

| Name | Build (no cache) | Build (with cache) | Memory (RSS) | Output size | Gzipped size |
| --- | --- | --- | --- | --- | --- |
| Rspack CLI 3.0.0 | 2030ms | 811ms | 900MB | 5934.3kB | 1368.1kB |
`;

test('default sampling strategy uses one outer sample and ten inner measured runs', () => {
  assert.equal(DEFAULT_SAMPLES_PER_VERSION, 1);
  assert.equal(DEFAULT_BENCHMARK_RUN_TIMES, 10);
  assert.equal(DEFAULT_BENCHMARK_WARMUP_TIMES, 2);
});

test('runner keeps a dedicated persistent-cache scenario for 1.7.11, latest, and canary', () => {
  assert.deepEqual(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'persistent-cache')?.versionKeys,
    ['1.7.11', 'latest', 'latest-canary'],
  );
  assert.equal(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'default-cache')?.label,
    'Memory cache',
  );
  assert.equal(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'persistent-cache')?.measureHmr,
    false,
  );
  assert.equal(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'persistent-cache')?.measureDev,
    false,
  );
  assert.equal(
    SCENARIO_MATRIX.find((scenario) => scenario.key === 'persistent-cache')?.measureBuildWithCache,
    true,
  );
});

test('version matrix compares stable latest with canary core latest', () => {
  const latest = VERSION_MATRIX.find((version) => version.key === 'latest');
  const canary = VERSION_MATRIX.find((version) => version.key === 'latest-canary');

  assert.equal(latest?.label, 'Rspack latest');
  assert.equal(latest?.root['@rspack/core'], 'latest');
  assert.equal(latest?.root['@rspack/plugin-react-refresh'], 'latest');
  assert.equal(canary?.label, 'Rspack latest (@rspack-canary/core)');
  assert.equal(canary?.root['@rspack/core'], 'latest');
  assert.equal(canary?.overrides?.['@rspack/core'], 'npm:@rspack-canary/core@latest');
  assert.deepEqual(canary?.peerDependencyAllowAny, ['@rspack/*']);
});

test('dependency updates preserve tag specifiers instead of resolving them first', () => {
  assert.equal(
    createDevDependencySetArgs({
      '@rspack/core': 'latest',
      '@rspack/plugin-react-refresh': 'latest',
    }),
    '"devDependencies.@rspack/core=latest" "devDependencies.@rspack/plugin-react-refresh=latest"',
  );
});

test('dynamic version installs opt out of CI frozen lockfiles', () => {
  assert.equal(
    createSetVersionInstallCommand({
      '@rspack/core': '1.0.0',
    }),
    'corepack pnpm pkg set "devDependencies.@rspack/core=1.0.0" && corepack pnpm install --no-frozen-lockfile',
  );
});

test('dynamic latest labels parse the installed Rspack CLI row by prefix', () => {
  assert.deepEqual(parseRunMetrics(SAMPLE_STDOUT, 'Rspack CLI'), {
    build_ms: 2030,
    build_with_cache_ms: undefined,
    startup_with_cache_ms: 800,
    hmr_ms: 93,
    output_size_kb: 5934.3,
  });
});

test('output size and startup-with-cache are parsed from the correct columns', () => {
  assert.deepEqual(parseRunMetrics(SAMPLE_STDOUT, 'Rspack CLI 3.0.0'), {
    build_ms: 2030,
    build_with_cache_ms: undefined,
    startup_with_cache_ms: 800,
    hmr_ms: 93,
    output_size_kb: 5934.3,
  });
});

test('persistent-cache metrics parse without an HMR column', () => {
  assert.deepEqual(
    parseRunMetrics(PERSISTENT_SAMPLE_STDOUT, 'Rspack CLI 3.0.0'),
    {
      build_ms: 2030,
      build_with_cache_ms: 811,
      startup_with_cache_ms: undefined,
      hmr_ms: undefined,
      output_size_kb: 5934.3,
    },
  );
});
