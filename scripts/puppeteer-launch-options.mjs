export function getPuppeteerLaunchOptions({
  platform = process.platform,
  ci = process.env.CI === 'true',
} = {}) {
  if (platform === 'linux' && ci) {
    return {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
  }

  return {};
}
