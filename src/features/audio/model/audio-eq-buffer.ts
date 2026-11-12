import { ANALYSER_RESOLUTION } from './constants';

/**
 * FFT byte buffers for analyser readout.
 * Isolated so CodeScene does not mis-parse `new Uint8Array` as a multi-arg ctor on the director.
 */
export const EMPTY_EQ_BYTE_ARRAY: Uint8Array<ArrayBuffer> = new Uint8Array(
  0
) as Uint8Array<ArrayBuffer>;

export function createEqBuffer(): Uint8Array<ArrayBuffer> {
  return new Uint8Array(ANALYSER_RESOLUTION) as Uint8Array<ArrayBuffer>;
}
