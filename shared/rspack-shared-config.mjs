import { defineConfig } from '@rspack/cli';

import { isProd, target } from './constants.mjs';

export function createRspackSharedConfig(rspackVersion) {
  const isRspack1x = /^1\./.test(rspackVersion);

  return defineConfig({
    devtool: isProd ? false : undefined,
    experiments: isRspack1x
      ? { css: true, lazyCompilation: !isProd }
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
    cache: isRspack1x ? true : { type: 'memory' },
  });
}
