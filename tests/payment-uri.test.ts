import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildPaymentUri, satsToBtcString } from '../src/lib/payment-uri.js';

const ARKADE_ADDRESS =
  'tark1qplnj2gett9j483fchy6chaxn4y52c4g7n5djh9xua3ywdxw0ldatc3e9xcj9xpx0r5tmr0dgvu2f4s352muklg0tcxx0scnnkraajy9jgz4xl';
const BARK_ADDRESS =
  'ark1pwh9vsmezqqpjy9akejayl2vvcse6he97rn40g84xrlvrlnhayuuyefrp9nse2yspqqjl5wpy';

describe('satsToBtcString', () => {
  it('formats sats as plain decimal bitcoin amounts', () => {
    assert.equal(satsToBtcString(2_100), '0.000021');
    assert.equal(satsToBtcString(99_000_000), '0.99');
  });
});

describe('buildPaymentUri', () => {
  it('builds an Ark-only URI compatible with Arkade style BIP21 usage', () => {
    assert.equal(
      buildPaymentUri({
        arkAddress: ARKADE_ADDRESS,
        amountSats: 2_100,
      }),
      `bitcoin:?ark=${ARKADE_ADDRESS}&amount=0.000021`,
    );
  });

  it('includes on-chain and lightning fallbacks when provided', () => {
    assert.equal(
      buildPaymentUri({
        arkAddress: BARK_ADDRESS,
        onchainAddress: 'bc1pdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefp0',
        lightning: 'lnbc2100n1p0testpayload',
      }),
      `bitcoin:bc1pdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefp0?ark=${BARK_ADDRESS}&lightning=lnbc2100n1p0testpayload`,
    );
  });

  it('rejects invalid Ark addresses', () => {
    assert.throws(
      () =>
        buildPaymentUri({
          arkAddress: 'not-an-ark-address',
        }),
      /Invalid Ark address/,
    );
  });
});
