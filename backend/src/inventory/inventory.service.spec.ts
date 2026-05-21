import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { MovementType } from '../common/enums';
import { Movement } from '../movements/entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryService } from './inventory.service';

function mockStockQb(rawMany: unknown[] = [], rawOne: unknown = null) {
  return {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rawMany),
    getRawOne: jest.fn().mockResolvedValue(rawOne),
  };
}

describe('InventoryService', () => {
  let service: InventoryService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let stockQb: ReturnType<typeof mockStockQb>;

  beforeEach(async () => {
    stockQb = mockStockQb();
    productRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(stockQb),
      manager: {
        createQueryBuilder: jest.fn(),
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
    expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('p');
    expect(stockQb.where).toHaveBeenCalledWith('p.active = :active', { active: true });
    expect(stockQb.setParameter).toHaveBeenCalledWith('inType', MovementType.IN);
  });

  it('maps inventory rows with numeric stock', async () => {
    stockQb.getRawMany.mockResolvedValue([
      {
        productId: '1',
        productName: 'A',
        category: 'c',
        unitMeasure: 'unidades',
        currentStock: '15',
        minStock: '10',
      },
    ]);

    const rows = await service.findAll();
    expect(rows[0].currentStock).toBe(15);
    expect(rows[0].minStock).toBe(10);
    expect(rows[0].productName).toBe('A');
  });

  it('throws when product stock not found', async () => {
    stockQb.getRawOne.mockResolvedValue(null);
    await expect(service.findByProductId('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns stock for existing product', async () => {
    stockQb.getRawOne.mockResolvedValue({
      productId: 'p1',
      minStock: '5',
      currentStock: '12',
    });

    const row = await service.findByProductId('p1');
    expect(row.currentStock).toBe(12);
    expect(row.minStock).toBe(5);
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

  it('filters low stock at boundary when equal', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValue([
      {
        productId: '1',
        productName: 'A',
        category: 'c',
        unitMeasure: 'unidades',
        currentStock: 5,
        minStock: 5,
      },
    ]);

    const low = await service.findLowStock();
    expect(low).toHaveLength(1);
  });

  it('getStockForProduct uses repository manager', async () => {
    const movementQb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ stock: '7' }),
    };
    productRepo.manager.createQueryBuilder = jest
      .fn()
      .mockReturnValue(movementQb) as unknown as typeof productRepo.manager.createQueryBuilder;

    const stock = await service.getStockForProduct('p1');
    expect(stock).toBe(7);
    expect(movementQb.setParameter).toHaveBeenCalledWith('inType', MovementType.IN);
  });

  it('getStockForProduct with entity manager', async () => {
    const movementQb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ stock: '3' }),
    };
    const manager = {
      createQueryBuilder: jest.fn().mockReturnValue(movementQb),
    } as unknown as EntityManager;

    const stock = await service.getStockForProduct('p1', manager);
    expect(stock).toBe(3);
    expect(manager.createQueryBuilder).toHaveBeenCalledWith(Movement, 'm');
  });

  it('getStockForProduct returns zero when no rows', async () => {
    const movementQb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(null),
    };
    productRepo.manager.createQueryBuilder = jest
      .fn()
      .mockReturnValue(movementQb) as unknown as typeof productRepo.manager.createQueryBuilder;

    const stock = await service.getStockForProduct('p1');
    expect(stock).toBe(0);
  });
});
