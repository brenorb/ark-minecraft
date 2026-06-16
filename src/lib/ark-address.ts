import { bech32m } from 'bech32';

export function isStructurallyValidArkAddress(address: string): boolean {
  try {
    const decoded = bech32m.decode(address, 1000);
    if (decoded.prefix !== 'ark' && decoded.prefix !== 'tark') {
      return false;
    }

    if (decoded.words.length < 2) {
      return false;
    }

    const version = decoded.words[0];

    if (version === 0) {
      const bytes = Buffer.from(bech32m.fromWords(decoded.words));
      return bytes.length === 65 && bytes[0] === 0;
    }

    if (version === 1) {
      const payload = Buffer.from(bech32m.fromWords(decoded.words.slice(1)));
      return payload.length >= 6;
    }

    return false;
  } catch {
    return false;
  }
}
