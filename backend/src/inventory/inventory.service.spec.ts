import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../products/entities/product.entity';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let productRepo: jest.Mocked<Repository<Product>>;

  beforeEach(async () => {
    const qb = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue(null),
    };

    productRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          setParameter: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ stock: '0' }),
        }),
      },
    } as unknown as jest.Mocked<Repository<Product>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
      ],
    }).compile();

    service = module.get(InventoryService);
  });

  it('returns empty inventory list', async () => {
    const rows = await service.findAll();
    expect(rows).toEqual([]);
  });

  it('throws when product stock not found', async () => {
    await expect(service.findByProductId('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('filters low stock rows', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValue([
      {
        productId: '1',
        productName: 'A',
        category: 'c',
        unitMeasure: 'unidades',
        currentStock: 2,
        minStock: 5,
      },
      {
        productId: '2',
        productName: 'B',
        category: 'c',
        unitMeasure: 'kg',
        currentStock: 10,
        minStock: 5,
      },
    ]);

    const low = await service.findLowStock();
    expect(low).toHaveLength(1);
    expect(low[0].productId).toBe('1');
  });
});
