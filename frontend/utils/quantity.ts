import type { UnitMeasure } from '@/types/inventory';

export const QUANTITY_MAX_DECIMALS = 3;

export function allowsDecimalQuantity(unit: UnitMeasure): boolean {
  return unit !== 'unidades';
}

export function sanitizeQuantityInput(text: string, unit: UnitMeasure): string {
  if (!allowsDecimalQuantity(unit)) {
    return text.replace(/\D/g, '');
  }
  let s = text.replace(/[^0-9.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = `${s.slice(0, dot + 1)}${s.slice(dot + 1).replace(/\./g, '')}`;
    const [whole, frac = ''] = s.split('.');
    s = `${whole}.${frac.slice(0, QUANTITY_MAX_DECIMALS)}`;
  }
  return s;
}

export function parseQuantityInput(text: string, unit: UnitMeasure): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (!allowsDecimalQuantity(unit) && trimmed.includes('.')) {
    return null;
  }
  const value = allowsDecimalQuantity(unit) ? parseFloat(trimmed) : parseInt(trimmed, 10);
  if (Number.isNaN(value) || value < 0) return null;
  if (!allowsDecimalQuantity(unit) && !Number.isInteger(value)) return null;
  if (allowsDecimalQuantity(unit)) {
    const factor = 10 ** QUANTITY_MAX_DECIMALS;
    if (Math.abs(value * factor - Math.round(value * factor)) >= 1e-8) {
      return null;
    }
  }
  return value;
}

export function formatQuantity(value: number, unit?: UnitMeasure | string): string {
  const u = (unit ?? 'unidades') as UnitMeasure;
  if (!allowsDecimalQuantity(u)) {
    return String(Math.round(value));
  }
  const factor = 10 ** QUANTITY_MAX_DECIMALS;
  const rounded = Math.round(value * factor) / factor;
  const fixed = rounded.toFixed(QUANTITY_MAX_DECIMALS);
  return fixed.replace(/\.?0+$/, '');
}
