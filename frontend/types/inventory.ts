export type UnitMeasure = 'unidades' | 'kg' | 'litros';

export type MovementType = 'IN' | 'OUT';

export type MovementReason = 'compra' | 'venta' | 'ajuste' | 'merma' | 'devolución';

export interface Product {
  id: string;
  name: string;
  description: string;
  unitMeasure: UnitMeasure;
  category: string;
  minStock: number;
  active: boolean;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  unitMeasure: UnitMeasure;
  category: string;
  minStock: number;
}

export interface InventoryRow {
  productId: string;
  productName?: string;
  category?: string;
  unitMeasure?: UnitMeasure;
  currentStock: number;
  minStock: number;
}

export interface ProductWithStock extends Product {
  currentStock: number;
  isLowStock: boolean;
}

export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  productId: string;
  product?: Product;
  reason: MovementReason;
  createdAt: string;
}

export interface CreateMovementPayload {
  type: MovementType;
  quantity: number;
  productId: string;
  reason: MovementReason;
}

export interface MovementFilters {
  productId?: string;
  type?: MovementType;
  startDate?: string;
  endDate?: string;
}
