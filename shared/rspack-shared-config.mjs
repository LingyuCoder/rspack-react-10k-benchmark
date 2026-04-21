import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rspack/cli';

import { isProd, target } from './constants.mjs';

function createPersistentCacheSettings(rspackVersion) {
  return {
    type: 'persistent',
    buildDependencies: [fileURLToPath(import.meta.url)],
    version: `${rspackVersion}-persistent`,
  };
}

export function createRspackSharedConfig(
  rspackVersion,
  cacheMode = 'default',
) {
  const isRspack1x = /^1\./.test(rspackVersion);
  const usePersistentCache = cacheMode === 'persistent';
  const persistentCacheSettings = createPersistentCacheSettings(rspackVersion);

  return defineConfig({
    devtool: isProd ? false : undefined,
    experiments: isRspack1x
      ? {
          css: true,
          lazyCompilation: !isProd,
          ...(usePersistentCache
            ? { cache: persistentCacheSettings }
            : {}),
        }
      : { css: false },
    target: ['web', target],
    lazyCompilation: isRspack1x ? undefined : !isProd,
    resolve: {
      extensions: ['...', '.tsx', '.ts', '.jsx'],
    },
    module: {
      defaultRules: [
        '...',
        {
          test: /\.css$/,
          type: 'css/auto',
        },
      ],
    },
    cache: isRspack1x
      ? true
      : usePersistentCache
        ? persistentCacheSettings
        : { type: 'memory' },
  });
}
