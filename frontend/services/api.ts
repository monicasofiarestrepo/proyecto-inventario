import axios from 'axios';

import type {
  CreateMovementPayload,
  CreateProductPayload,
  InventoryRow,
  Movement,
  MovementFilters,
  Product,
  ProductWithStock,
} from '@/types/inventory';

const baseURL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000,
});

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    unitMeasure: raw.unitMeasure as Product['unitMeasure'],
    category: String(raw.category ?? ''),
    minStock: Number(raw.minStock ?? raw.min_stock ?? 0),
    active: Boolean(raw.active ?? raw.status ?? true),
  };
}

function mapMovement(raw: Record<string, unknown>): Movement {
  const product = raw.product as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    type: raw.type as Movement['type'],
    quantity: Number(raw.quantity),
    productId: String(raw.productId ?? raw.product_id ?? product?.id ?? ''),
    product: product ? mapProduct(product) : undefined,
    reason: raw.reason as Movement['reason'],
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
  };
}

function mapInventory(raw: Record<string, unknown>): InventoryRow {
  return {
    productId: String(raw.productId ?? raw.product_id),
    productName: raw.productName ? String(raw.productName) : undefined,
    category: raw.category ? String(raw.category) : undefined,
    unitMeasure: raw.unitMeasure as InventoryRow['unitMeasure'],
    currentStock: Number(raw.currentStock ?? raw.current_stock ?? 0),
    minStock: Number(raw.minStock ?? raw.min_stock ?? 0),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Record<string, unknown>[]>('/products');
  return (data ?? []).map(mapProduct).filter((p) => p.active);
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get<Record<string, unknown>>(`/products/${id}`);
  return mapProduct(data);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await api.post<Record<string, unknown>>('/products', payload);
  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  payload: Partial<CreateProductPayload> & { active?: boolean },
): Promise<Product> {
  const { data } = await api.patch<Record<string, unknown>>(`/products/${id}`, payload);
  return mapProduct(data);
}

export async function deactivateProduct(id: string): Promise<Product> {
  const { data } = await api.delete<Record<string, unknown>>(`/products/${id}`);
  return mapProduct(data);
}

export async function fetchInventory(): Promise<InventoryRow[]> {
  const { data } = await api.get<Record<string, unknown>[]>('/inventory');
  return (data ?? []).map(mapInventory);
}

export async function fetchProductStock(productId: string): Promise<number> {
  const { data } = await api.get<Record<string, unknown>>(`/inventory/${productId}`);
  return Number(data.currentStock ?? data.current_stock ?? data.stock ?? 0);
}

export async function fetchLowStockAlerts(): Promise<InventoryRow[]> {
  const { data } = await api.get<Record<string, unknown>[]>('/inventory/alerts/low-stock');
  return (data ?? []).map(mapInventory);
}

export async function fetchProductsWithStock(): Promise<ProductWithStock[]> {
  const [products, inventory] = await Promise.all([fetchProducts(), fetchInventory()]);
  const stockMap = new Map(inventory.map((i) => [i.productId, i]));

  return products.map((p) => {
    const row = stockMap.get(p.id);
    const currentStock = row?.currentStock ?? 0;
    const minStock = row?.minStock ?? p.minStock;
    return {
      ...p,
      currentStock,
      isLowStock: currentStock <= minStock,
    };
  });
}

export async function fetchMovements(filters?: MovementFilters): Promise<Movement[]> {
  const { data } = await api.get<Record<string, unknown>[]>('/movements', { params: filters });
  return (data ?? []).map(mapMovement);
}

export async function createMovement(payload: CreateMovementPayload): Promise<Movement> {
  const { data } = await api.post<Record<string, unknown>>('/movements', payload);
  return mapMovement(data);
}
