// @ts-check
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import * as reactRefreshPluginModule from '@rspack/plugin-react-refresh';
import sharedConfig from '../../shared/rspack.config.mjs';
import { isProd, target } from '../../shared/constants.mjs';
import { resolveReactRefreshRspackPlugin } from '../../shared/resolve-react-refresh-plugin.mjs';

const ReactRefreshRspackPlugin = resolveReactRefreshRspackPlugin(
  reactRefreshPluginModule,
);

export default defineConfig({
  ...sharedConfig,
  entry: './src/index.jsx',
  module: {
    ...sharedConfig.module,
    rules: [
      {
        test: /\.(js|ts|tsx|jsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          /** @type {import('@rspack/core').SwcLoaderOptions} */
          options: {
            jsc: {
              target,
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: !isProd,
                  refresh: !isProd,
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: 'index-rspack.html' }),
    !isProd && new ReactRefreshRspackPlugin(),
  ],
});
