const API_URL = (
  process.env.PLAYWRIGHT_API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000'
).replace(/\/$/, '');

export type TestProduct = { id: string; name: string };

export async function createTestProduct(
  suffix: string,
  minStock = 5,
): Promise<TestProduct> {
  const name = `E2E-${suffix}-${Date.now()}`;
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description: 'e2e',
      unitMeasure: 'unidades',
      category: 'E2E',
      minStock,
    }),
  });
  if (!res.ok) {
    throw new Error(`createProduct failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { id: string; name: string };
  return { id: body.id, name: body.name ?? name };
}

export async function addMovement(
  productId: string,
  type: 'IN' | 'OUT',
  quantity: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      quantity,
      productId,
      reason: type === 'IN' ? 'compra' : 'venta',
    }),
  });
  if (!res.ok) {
    throw new Error(`addMovement failed: ${res.status} ${await res.text()}`);
  }
}

export { API_URL };
