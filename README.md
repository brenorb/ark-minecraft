# ark-minecraft

Small CLI that turns an Ark-compatible Bitcoin payment URI into a Minecraft map file.

It does one useful thing on purpose:

1. Build a unified `bitcoin:` payment URI that Arkade and Bark-style wallets can understand.
2. Render that URI as a QR code.
3. Encode the QR into a gzipped `map_<id>.dat`.
4. Print the `/give` command for modern Minecraft.

This is the smallest credible slice of the `pay2craft` idea. It covers the hard Minecraft rendering path first and leaves live merchant flows, swap orchestration, and payment confirmation for later.

## Why TypeScript, not Rust

Rust would be fine for a production plugin, but it is the wrong default for this repo today.

- Arkade's official wallet and swap SDKs are TypeScript-first.
- The best public map-file references are also TypeScript.
- The user asked to keep this small and working.

So v1 stays close to the official tooling instead of wrapping or reimplementing it.

## Sources

- [Arkade Lightning Swaps docs](https://docs.arkadeos.com/contracts/lightning-swaps)
- [Arkade TypeScript SDK](https://github.com/arkade-os/ts-sdk)
- [Bark BIP321 implementation](https://gitlab.com/second-tech/bark)
- [BTCPay Arkade plugin](https://github.com/ArkLabsHQ/btcpay-arkade)

The experienced-dev tip to use Arkade + Boltz is the right direction for live payment flows. This repo stops one layer earlier on purpose: it generates the in-game QR artifact that a plugin or backend can hand to the player.

One important compatibility note: Arkade's current helper APIs are not enough by themselves to validate both Arkade `v0` and Bark `v1` addresses. This repo therefore uses the public BOAT-001 address format plus bech32m for a tiny cross-wallet validator.

## Install

```bash
npm install
npm test
```

## Usage

```bash
npm run build && node dist/src/cli.js \
  --ark ark1p... \
  --amount-sats 990000 \
  --map-id 42
```

Optional flags:

- `--onchain bc1...`
- `--lightning lnbc...`
- `--data-version 2711`
- `--out-dir out`
- `--target-selector @p`

Outputs:

- `out/map_<id>.dat`
- `out/map_<id>.json`

Example `give` command:

```mcfunction
/give @p minecraft:filled_map[map_id=42] 1
```

## Scope

Included:

- Unified Ark payment URI generation
- QR rasterization to Minecraft map colors
- Gzipped `data/map_<id>.dat`-compatible output
- Small test suite around the payload and map encoding

Not included yet:

- Arkade wallet bootstrap
- Boltz invoice creation
- Payment webhooks
- Bukkit/Paper/Fabric plugin delivery
