import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bech32m } from 'bech32';

it('rejects invalid data versions before writing a map bundle', () => {
  const ark = bech32m.encode('tark', [1, ...bech32m.toWords(Buffer.alloc(32, 17))], 200);
  const outputRoot = mkdtempSync(path.join(tmpdir(), 'ark-map-version-'));
  try {
    for (const [index, value] of ['', 'banana', '1.5', '-1', '2147483648'].entries()) {
      const outDir = path.join(outputRoot, String(index));
      const result = spawnSync(process.execPath, [
        fileURLToPath(new URL('../src/cli.js', import.meta.url)),
        '--ark', ark,
        '--map-id', '42',
        `--data-version=${value}`,
        '--out-dir', outDir,
      ], { encoding: 'utf8' });
      assert.equal(result.status, 1, `data version: "${value}"`);
      assert.match(result.stderr, /dataVersion must be a non-negative 32-bit integer/);
      assert.equal(existsSync(outDir), false);
    }
  } finally {
    rmSync(outputRoot, { recursive: true, force: true });
  }
});
