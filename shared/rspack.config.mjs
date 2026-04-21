// @ts-check
import { createRequire } from 'node:module';
import { createRspackSharedConfig } from './rspack-shared-config.mjs';
import { rspackCacheMode } from './constants.mjs';

const require = createRequire(import.meta.url);
const rspackVersion = require('@rspack/core/package.json').version;

export default createRspackSharedConfig(rspackVersion, rspackCacheMode);
