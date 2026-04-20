import fs from 'node:fs';
import path from 'node:path';

export function resolveBinFilePath(rootDir, candidates) {
  for (const candidate of candidates) {
    const filePath = path.join(rootDir, candidate);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  throw new Error(
    `Unable to find a matching bin file. Tried: ${candidates.join(', ')}`,
  );
}
