import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DEFAULT_MAP_DATA_VERSION,
  encodeMapDat,
  renderQrMapColors,
} from './minecraft-map.js';
import { buildPaymentUri, type PaymentUriOptions } from './payment-uri.js';

export interface MapBundleOptions extends PaymentUriOptions {
  dataVersion?: number;
  mapId: number;
  outDir: string;
  targetSelector?: string;
}

export function buildGiveCommand(mapId: number, targetSelector = '@p'): string {
  if (!Number.isSafeInteger(mapId) || mapId < 0) {
    throw new Error('mapId must be a non-negative safe integer');
  }

  if (targetSelector.length === 0) {
    throw new Error('targetSelector must not be empty');
  }

  return `/give ${targetSelector} minecraft:filled_map[map_id=${mapId}] 1`;
}

export async function writeMapBundle(options: MapBundleOptions) {
  const paymentUri = buildPaymentUri(options);
  const colors = renderQrMapColors(paymentUri);
  const mapDat = encodeMapDat(colors, options.dataVersion ?? DEFAULT_MAP_DATA_VERSION);
  const giveCommand = buildGiveCommand(options.mapId, options.targetSelector);
  const baseName = `map_${options.mapId}`;
  const mapPath = path.join(options.outDir, `${baseName}.dat`);
  const metadataPath = path.join(options.outDir, `${baseName}.json`);

  await mkdir(options.outDir, { recursive: true });
  await writeFile(mapPath, mapDat);
  await writeFile(
    metadataPath,
    JSON.stringify(
      {
        mapId: options.mapId,
        dataVersion: options.dataVersion ?? DEFAULT_MAP_DATA_VERSION,
        paymentUri,
        giveCommand,
      },
      null,
      2,
    ),
  );

  return {
    giveCommand,
    mapPath,
    metadataPath,
    paymentUri,
  };
}
