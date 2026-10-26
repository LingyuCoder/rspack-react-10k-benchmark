# Rspack React-10k Benchmark

Minimal standalone benchmark repository for comparing `Rspack 1.0.0`, `1.7.11`, `2.0.0`, `2.1.0-rc.0`, `2.2.0`, `2.3.0-beta.1`, `latest`, and `latest` with `@rspack-canary/core` on the `react-10k` case.

## What It Benchmarks

- Memory cache scenario:
  - `Build (no cache)`
  - `HMR`
  - `Output size`
- Persistent cache scenario (all versions above except `Rspack 1.0.0`):
  - `Build (no cache)`
  - `Build (with persistent cache)`
  - `Output size`

## Local Usage

Install dependencies:

```bash
pnpm install
npx puppeteer browsers install chrome
```

Run the benchmark matrix:

```bash
pnpm benchmark:versions
```

Run only the persistent-cache comparison:

```bash
SCENARIOS=persistent-cache pnpm benchmark:versions
```

Default sampling strategy:

- outer samples per version: `1`
- inner benchmark measured runs: `10`
- inner benchmark warmup runs: `2`

Generate the report files from the raw samples:

```bash
pnpm report
```

Run both steps together:

```bash
pnpm run ci
```

## Output

Generated files land in `artifacts/`:

- `run-samples.json`
- `run-meta.json`
- `report.json`
- `report.md`

## Notes

- The repository keeps one copy of the `react-10k` source and switches Rspack versions during execution.
- `Rspack 1.0.0` uses a `webpack-dev-server@5.0.4` override for compatibility.
- The `2.2.0` and `2.3.0-beta.1` scenarios pin their matching core and CLI packages while sharing `@rspack/dev-server@2.2.2` and `@rspack/plugin-react-refresh@2.0.2`.
- The canary scenario follows the Rspack canary install guidance by overriding `@rspack/core` with `npm:@rspack-canary/core@latest`.
