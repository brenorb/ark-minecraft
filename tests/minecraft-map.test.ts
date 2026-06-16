import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';

import { describe, it } from 'node:test';

import { buildGiveCommand } from '../src/lib/bundle.js';
import {
  DEFAULT_MAP_DATA_VERSION,
  MAP_PIXEL_COUNT,
  MAP_WHITE,
  encodeMapDat,
  renderQrMapColors,
} from '../src/lib/minecraft-map.js';

describe('renderQrMapColors', () => {
  it('renders a full 128x128 map color array', () => {
    const colors = renderQrMapColors('bitcoin:?ark=ark1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');

    assert.equal(colors.length, MAP_PIXEL_COUNT);
    assert.equal(colors[0], MAP_WHITE);
    assert.equal(colors.some((value) => value !== MAP_WHITE), true);
  });
});

describe('encodeMapDat', () => {
  it('writes gzipped map NBT', () => {
    const colors = new Int8Array(MAP_PIXEL_COUNT).fill(MAP_WHITE);
    const buffer = encodeMapDat(colors, DEFAULT_MAP_DATA_VERSION);
    const unzipped = gunzipSync(buffer);
    const text = unzipped.toString('latin1');

    assert.equal(buffer[0], 0x1f);
    assert.equal(buffer[1], 0x8b);
    assert.equal(text.includes('DataVersion'), true);
    assert.equal(text.includes('minecraft:overworld'), true);
  });
});

describe('buildGiveCommand', () => {
  it('uses the modern map_id component syntax', () => {
    assert.equal(buildGiveCommand(42), '/give @p minecraft:filled_map[map_id=42] 1');
  });
});
