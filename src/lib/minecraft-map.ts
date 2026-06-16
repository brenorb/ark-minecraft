import { gzipSync } from 'node:zlib';

import QRCode from 'qrcode';
import { Byte, Int, Short, encode } from 'nbt-ts';

export const MAP_SIDE_LENGTH = 128;
export const MAP_PIXEL_COUNT = MAP_SIDE_LENGTH * MAP_SIDE_LENGTH;
export const DEFAULT_MAP_DATA_VERSION = 2711;
export const MAP_WHITE = 34;
export const MAP_BLACK = 118;

export interface RenderQrMapOptions {
  darkColor?: number;
  lightColor?: number;
  marginModules?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export function renderQrMapColors(
  payload: string,
  options: RenderQrMapOptions = {},
): Int8Array {
  const qr = QRCode.create(payload, {
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
  });
  const marginModules = options.marginModules ?? 2;
  const lightColor = options.lightColor ?? MAP_WHITE;
  const darkColor = options.darkColor ?? MAP_BLACK;
  const moduleCount = qr.modules.size;
  const totalModules = moduleCount + marginModules * 2;
  const moduleSize = Math.floor(MAP_SIDE_LENGTH / totalModules);

  if (moduleSize < 1) {
    throw new Error('QR payload is too dense for a single Minecraft map');
  }

  const canvasSize = totalModules * moduleSize;
  const offset = Math.floor((MAP_SIDE_LENGTH - canvasSize) / 2);
  const colors = new Int8Array(MAP_PIXEL_COUNT).fill(lightColor);

  for (let y = 0; y < moduleCount; y += 1) {
    for (let x = 0; x < moduleCount; x += 1) {
      if (!qr.modules.get(x, y)) {
        continue;
      }

      const startX = offset + (x + marginModules) * moduleSize;
      const startY = offset + (y + marginModules) * moduleSize;

      for (let dy = 0; dy < moduleSize; dy += 1) {
        const rowOffset = (startY + dy) * MAP_SIDE_LENGTH;
        for (let dx = 0; dx < moduleSize; dx += 1) {
          colors[rowOffset + startX + dx] = darkColor;
        }
      }
    }
  }

  return colors;
}

export function encodeMapDat(colors: Int8Array, dataVersion = DEFAULT_MAP_DATA_VERSION): Buffer {
  if (colors.length !== MAP_PIXEL_COUNT) {
    throw new Error(`Map color array must contain exactly ${MAP_PIXEL_COUNT} pixels`);
  }

  const nbt = encode('root', {
    data: {
      banners: [],
      colors,
      dimension: 'minecraft:overworld',
      frames: [],
      locked: new Byte(1),
      height: new Short(MAP_SIDE_LENGTH),
      scale: new Byte(0),
      trackingPosition: new Byte(0),
      unlimitedTracking: new Byte(0),
      width: new Short(MAP_SIDE_LENGTH),
      xCenter: new Int(0),
      zCenter: new Int(0),
    },
    DataVersion: new Int(dataVersion),
  });

  return gzipSync(nbt);
}
