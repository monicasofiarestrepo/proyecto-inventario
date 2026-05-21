import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { MovementType } from '../common/enums';
import { Movement } from '../movements/entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryRowDto, ProductStockDto } from './dto/inventory-row.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<InventoryRowDto[]> {
    const rows = await this.stockQuery().getRawMany<{
      productId: string;
      productName: string;
      category: string;
      unitMeasure: string;
      minStock: string;
      currentStock: string;
    }>();

    return rows.map((r) => this.mapRow(r));
  }

  async findByProductId(productId: string): Promise<ProductStockDto> {
    const row = await this.stockQuery()
      .andWhere('p.id = :productId', { productId })
      .getRawOne<{
        productId: string;
        minStock: string;
        currentStock: string;
      }>();

    if (!row) {
      throw new NotFoundException(`Producto ${productId} no encontrado`);
    }

    return {
      productId: row.productId,
      currentStock: Number(row.currentStock),
      minStock: Number(row.minStock),
    };
  }

  async findLowStock(): Promise<InventoryRowDto[]> {
    const all = await this.findAll();
    return all.filter((r) => r.currentStock <= r.minStock);
  }

  async getStockForProduct(
    productId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const qb = manager
      ? manager.createQueryBuilder(Movement, 'm')
      : this.productRepo.manager.createQueryBuilder(Movement, 'm');

    const result = await qb
      .select(
        `COALESCE(SUM(CASE WHEN m.type = :inType THEN m.quantity ELSE -m.quantity END), 0)`,
        'stock',
      )
      .where('m.productId = :productId', { productId })
      .setParameter('inType', MovementType.IN)
      .getRawOne<{ stock: string }>();

    return Number(result?.stock ?? 0);
  }

  private stockQuery() {
    return this.productRepo
      .createQueryBuilder('p')
      .leftJoin('p.movements', 'm')
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.category', 'category')
      .addSelect('p.unitMeasure', 'unitMeasure')
      .addSelect('p.minStock', 'minStock')
      .addSelect(
        `COALESCE(SUM(CASE WHEN m.type = :inType THEN m.quantity ELSE -m.quantity END), 0)`,
        'currentStock',
      )
      .where('p.active = :active', { active: true })
      .setParameter('inType', MovementType.IN)
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.category')
      .addGroupBy('p.unitMeasure')
      .addGroupBy('p.minStock');
  }

  private mapRow(r: {
    productId: string;
    productName: string;
    category: string;
    unitMeasure: string;
    minStock: string;
    currentStock: string;
  }): InventoryRowDto {
    return {
      productId: r.productId,
      productName: r.productName,
      category: r.category,
      unitMeasure: r.unitMeasure as InventoryRowDto['unitMeasure'],
      minStock: Number(r.minStock),
      currentStock: Number(r.currentStock),
    };
  }
}
