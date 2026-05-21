import { UnitMeasure } from '../../common/enums';

export class InventoryRowDto {
  productId: string;
  productName: string;
  category: string;
  unitMeasure: UnitMeasure;
  currentStock: number;
  minStock: number;
}

export class ProductStockDto {
  productId: string;
  currentStock: number;
  minStock: number;
}
