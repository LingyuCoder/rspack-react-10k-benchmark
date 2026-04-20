// @ts-check
import { createRequire } from 'node:module';
import { defineConfig } from '@rspack/cli';
import { isProd, target } from './constants.mjs';

const require = createRequire(import.meta.url);
const rspackVersion = require('@rspack/core/package.json').version;
const isRspack1x = /^1\./.test(rspackVersion);

export default defineConfig({
  devtool: isProd ? false : undefined,
  experiments: isRspack1x ? { css: true } : undefined,
  target: ['web', target],
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
