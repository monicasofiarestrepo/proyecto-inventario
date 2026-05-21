import { expect, test } from '@playwright/test';

import { addMovement, createTestProduct } from './helpers/api';

test.describe('Lista de productos', () => {
  test('muestra stock y alerta de bajo stock', async ({ page }) => {
    const product = await createTestProduct('list', 10);
    await addMovement(product.id, 'IN', 3);

    await page.goto('/');
    await expect(page.getByText('INVENTARIO')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(product.name)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/BAJO STOCK/i)).toBeVisible();
  });
});
