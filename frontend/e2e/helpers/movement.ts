import { expect, type Page } from '@playwright/test';

import type { TestProduct } from './api';

export async function waitForMovementCatalog(page: Page) {
  await expect(page.getByText('INVENTARIO')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('LOADING CATALOG')).toBeHidden({ timeout: 35_000 });
  await expect(page.getByText('No hay productos activos')).toBeHidden({ timeout: 5_000 });
  await expect(page.getByText('PRODUCTO')).toBeVisible({ timeout: 10_000 });
}

export async function selectProduct(page: Page, product: TestProduct) {
  const chip = page.getByRole('button', { name: product.name });
  await expect(chip).toBeVisible({ timeout: 30_000 });
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
}
