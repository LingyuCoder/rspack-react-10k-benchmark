export const caseName = process.env.CASE ?? 'react-10k';
export const target = 'es2022';
export const targetBrowser = `Chrome >= 93`;
export const isProd = process.env.NODE_ENV === 'production';
export const rspackCacheMode = process.env.RSPACK_CACHE_MODE ?? 'default';
