import * as fc from 'fast-check';

import { UnitMeasure } from './enums';
import {
  isValidQuantity,
  normalizeQuantity,
  QUANTITY_MAX_DECIMALS,
} from './quantity.util';

describe('quantity.util PBT', () => {
  it('normalizeQuantity yields valid quantity for unidades', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1e6, noNaN: true }), (n) => {
        const q = normalizeQuantity(n, UnitMeasure.UNIDADES);
        return isValidQuantity(q, UnitMeasure.UNIDADES);
      }),
    );
  });

  it('normalizeQuantity respects max decimal places for kg', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1e4, noNaN: true }), (n) => {
        const q = normalizeQuantity(n, UnitMeasure.KG);
        const factor = 10 ** QUANTITY_MAX_DECIMALS;
        return Math.abs(q * factor - Math.round(q * factor)) < 1e-8;
      }),
    );
  });

  it('rejects values with more than 3 decimal places', () => {
    expect(isValidQuantity(1.2345, UnitMeasure.LITROS)).toBe(false);
    expect(isValidQuantity(1.234, UnitMeasure.LITROS)).toBe(true);
  });
});
