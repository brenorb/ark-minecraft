import { isStructurallyValidArkAddress } from './ark-address.js';

export interface PaymentUriOptions {
  arkAddress: string;
  amountSats?: number;
  lightning?: string;
  onchainAddress?: string;
}

export function satsToBtcString(sats: number): string {
  if (!Number.isSafeInteger(sats) || sats < 0) {
    throw new Error('amountSats must be a non-negative safe integer');
  }

  if (sats === 0) {
    return '0';
  }

  return (sats / 100_000_000).toFixed(8).replace(/\.?0+$/, '');
}

export function buildPaymentUri(options: PaymentUriOptions): string {
  const { arkAddress, amountSats, lightning, onchainAddress } = options;

  if (!isStructurallyValidArkAddress(arkAddress)) {
    throw new Error('Invalid Ark address');
  }

  if (lightning != null && lightning.length === 0) {
    throw new Error('lightning must not be empty');
  }

  if (onchainAddress != null && onchainAddress.length === 0) {
    throw new Error('onchainAddress must not be empty');
  }

  const params = new URLSearchParams();
  params.set('ark', arkAddress);

  if (typeof amountSats === 'number') {
    params.set('amount', satsToBtcString(amountSats));
  }

  if (lightning) {
    params.set('lightning', lightning);
  }

  const prefix = `bitcoin:${onchainAddress ?? ''}`;
  return `${prefix}?${params.toString()}`;
}
