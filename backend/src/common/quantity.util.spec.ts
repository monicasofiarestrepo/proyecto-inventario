import { UnitMeasure } from './enums';
import {
  isPositiveQuantity,
  isValidQuantity,
  normalizeQuantity,
} from './quantity.util';

describe('quantity.util', () => {
  it('accepts integers for unidades', () => {
    expect(isValidQuantity(10, UnitMeasure.UNIDADES)).toBe(true);
    expect(isValidQuantity(10.5, UnitMeasure.UNIDADES)).toBe(false);
  });

  it('accepts up to 3 decimals for kg and litros', () => {
    expect(isValidQuantity(2.5, UnitMeasure.KG)).toBe(true);
    expect(isValidQuantity(1.234, UnitMeasure.LITROS)).toBe(true);
    expect(isValidQuantity(1.2345, UnitMeasure.KG)).toBe(false);
  });

  it('normalizes decimal quantities', () => {
    expect(normalizeQuantity(1.23456, UnitMeasure.KG)).toBe(1.235);
    expect(normalizeQuantity(4.6, UnitMeasure.UNIDADES)).toBe(5);
  });

  it('requires positive quantity for movements', () => {
    expect(isPositiveQuantity(0, UnitMeasure.UNIDADES)).toBe(false);
    expect(isPositiveQuantity(0.5, UnitMeasure.KG)).toBe(true);
  });
});
