import { UnitMeasure } from './enums';

export const QUANTITY_MAX_DECIMALS = 3;

export function allowsDecimalQuantity(unit: UnitMeasure): boolean {
  return unit !== UnitMeasure.UNIDADES;
}

export function normalizeQuantity(value: number, unit: UnitMeasure): number {
  if (!allowsDecimalQuantity(unit)) {
    return Math.round(value);
  }
  const factor = 10 ** QUANTITY_MAX_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function hasValidDecimalPlaces(
  value: number,
  maxDecimals = QUANTITY_MAX_DECIMALS,
): boolean {
  const factor = 10 ** maxDecimals;
  return Math.abs(value * factor - Math.round(value * factor)) < 1e-8;
}

export function isValidQuantity(value: number, unit: UnitMeasure): boolean {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return false;
  }
  if (!allowsDecimalQuantity(unit)) {
    return Number.isInteger(value);
  }
  return hasValidDecimalPlaces(value);
}

export function isPositiveQuantity(value: number, unit: UnitMeasure): boolean {
  return isValidQuantity(value, unit) && value > 0;
}

export function quantityValidationMessage(unit: UnitMeasure): string {
  return allowsDecimalQuantity(unit)
    ? 'Debe ser >= 0 con hasta 3 decimales'
    : 'Debe ser un entero >= 0';
}
