import { expect, test } from '@playwright/test';

import { addMovement, createTestProduct } from './helpers/api';
import { selectProduct, waitForMovementCatalog } from './helpers/movement';

test.describe.configure({ mode: 'serial' });

test.describe('Formulario de movimiento', () => {
  test('bloquea salida cuando cantidad supera stock', async ({ page }) => {
    const product = await createTestProduct('move-block', 1);
    await addMovement(product.id, 'IN', 5);

    await page.goto('/movement');
    await waitForMovementCatalog(page);
    await selectProduct(page, product);

    await page.getByRole('tab', { name: 'SALIDA' }).click();
    await expect(page.getByText(/STOCK DISPONIBLE/i)).toBeVisible({ timeout: 15_000 });

    await page.getByPlaceholder('1').fill('10');
    const submit = page.getByRole('button', { name: 'Registrar' });
    await expect(submit).toBeDisabled();
    await expect(page.getByText(/Máximo/i)).toBeVisible();
  });

  test('registra entrada valida', async ({ page }) => {
    const product = await createTestProduct('move-in', 0);

    await page.goto('/movement');
    await waitForMovementCatalog(page);
    await selectProduct(page, product);

    await page.getByRole('tab', { name: 'ENTRADA' }).click();
    await page.getByPlaceholder('1').fill('7');
    await page.getByRole('button', { name: 'Registrar' }).click();
    await expect(page.getByText(/MOVIMIENTO REGISTRADO/i)).toBeVisible({ timeout: 15_000 });
  });
});
