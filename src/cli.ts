#!/usr/bin/env node

import { parseArgs } from 'node:util';

import { writeMapBundle } from './lib/bundle.js';

function printHelp() {
  console.log(`ark-minecraft

Generate a Minecraft map_<id>.dat from an Ark-compatible payment URI.

Required:
  --ark <address>          Arkade or Bark address
  --map-id <integer>       Map id to write

Optional:
  --amount-sats <integer>  Amount in satoshis
  --lightning <invoice>    Lightning invoice or LNURL
  --onchain <address>      Optional on-chain fallback address
  --data-version <int>     Non-negative 32-bit Minecraft DataVersion, default 2711
  --out-dir <path>         Output directory, default out
  --target-selector <sel>  Give command target, default @p
  --help                   Show this text
`);
}

async function main() {
  const { values } = parseArgs({
    options: {
      ark: { type: 'string' },
      'amount-sats': { type: 'string' },
      lightning: { type: 'string' },
      onchain: { type: 'string' },
      'map-id': { type: 'string' },
      'data-version': { type: 'string' },
      'out-dir': { type: 'string' },
      'target-selector': { type: 'string' },
      help: { type: 'boolean' },
    },
    allowPositionals: false,
  });

  if (values.help) {
    printHelp();
    return;
  }

  if (!values.ark || !values['map-id']) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const dataVersion = values['data-version']?.trim();
  const result = await writeMapBundle({
    arkAddress: values.ark,
    amountSats: values['amount-sats'] ? Number(values['amount-sats']) : undefined,
    lightning: values.lightning,
    onchainAddress: values.onchain,
    dataVersion: dataVersion === undefined ? undefined : Number(dataVersion || NaN),
    mapId: Number(values['map-id']),
    outDir: values['out-dir'] ?? 'out',
    targetSelector: values['target-selector'] ?? '@p',
  });

  console.log(result.paymentUri);
  console.log(result.giveCommand);
  console.log(result.mapPath);
  console.log(result.metadataPath);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
