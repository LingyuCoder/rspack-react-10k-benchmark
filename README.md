# Rspack React-10k Benchmark

Minimal standalone benchmark repository for comparing `Rspack 1.0.0`, `1.7.11`, and `2.0.0-rc.2` on the `react-10k` case.

## What It Benchmarks

- `Build (no cache)`
- `HMR`
- `Output size`

## Local Usage

Install dependencies:

```bash
pnpm install
npx puppeteer browsers install chrome
```

Run the three-version benchmark matrix:

```bash
pnpm benchmark:versions
```

Generate the report files from the raw samples:

```bash
pnpm report
```

Run both steps together:

```bash
pnpm ci
```

## Output

Generated files land in `artifacts/`:

- `run-samples.json`
- `report.json`
- `report.md`

## Notes

- The repository keeps one copy of the `react-10k` source and switches Rspack versions during execution.
- `Rspack 1.0.0` uses a `webpack-dev-server@5.0.4` override for compatibility.
