import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { MovementReason, MovementType, UnitMeasure } from '../common/enums';
import { InventoryService } from '../inventory/inventory.service';
import { Product } from '../products/entities/product.entity';
import { Movement } from './entities/movement.entity';
import { MovementsService } from './movements.service';

describe('MovementsService', () => {
  let service: MovementsService;
  let movementRepo: jest.Mocked<Repository<Movement>>;
  let productRepo: jest.Mocked<Repository<Product>>;
  let inventoryService: jest.Mocked<Pick<InventoryService, 'getStockForProduct'>>;
  let dataSource: { transaction: jest.Mock };
  let listQb: {
    leftJoinAndSelect: jest.Mock;
    orderBy: jest.Mock;
    andWhere: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    listQb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    movementRepo = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(listQb),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Movement>>;

    productRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Product>>;

    inventoryService = {
      getStockForProduct: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        { provide: getRepositoryToken(Movement), useValue: movementRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: InventoryService, useValue: inventoryService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(MovementsService);
  });

  it('rejects OUT when stock is insufficient', async () => {
    const product = { id: 'p1', active: true, unitMeasure: UnitMeasure.UNIDADES } as Product;
    productRepo.findOne.mockResolvedValue(product);

    dataSource.transaction.mockImplementation(async (fn) => {
      inventoryService.getStockForProduct.mockResolvedValue(5);
      return fn({} as never);
    });

    await expect(
      service.create({
        type: MovementType.OUT,
        quantity: 10,
        productId: 'p1',
        reason: MovementReason.VENTA,
      }),
    ).rejects.toThrow('Stock insuficiente. Disponible: 5');
  });

  it('rejects zero quantity', async () => {
    const product = { id: 'p1', active: true, unitMeasure: UnitMeasure.UNIDADES } as Product;
    productRepo.findOne.mockResolvedValue(product);
    await expect(
      service.create({
        type: MovementType.IN,
        quantity: 0,
        productId: 'p1',
        reason: MovementReason.COMPRA,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates OUT when stock is sufficient', async () => {
    const product = { id: 'p1', active: true, unitMeasure: UnitMeasure.UNIDADES } as Product;
    productRepo.findOne.mockResolvedValue(product);
    const saved = { id: 'm-out' } as Movement;

    dataSource.transaction.mockImplementation(async (fn) => {
      inventoryService.getStockForProduct.mockResolvedValue(10);
      const manager = {
        create: jest.fn().mockReturnValue(saved),
        save: jest.fn().mockResolvedValue(saved),
      };
      return fn(manager);
    });

    const result = await service.create({
      type: MovementType.OUT,
      quantity: 10,
      productId: 'p1',
      reason: MovementReason.VENTA,
    });
    expect(result.id).toBe('m-out');
  });

  it('allows OUT when quantity equals stock', async () => {
    const product = { id: 'p1', active: true, unitMeasure: UnitMeasure.UNIDADES } as Product;
    productRepo.findOne.mockResolvedValue(product);
    const saved = { id: 'm-edge' } as Movement;
    dataSource.transaction.mockImplementation(async (fn) => {
      inventoryService.getStockForProduct.mockResolvedValue(3);
      const manager = {
        create: jest.fn().mockReturnValue(saved),
        save: jest.fn().mockResolvedValue(saved),
      };
      return fn(manager);
    });
    const result = await service.create({
      type: MovementType.OUT,
      quantity: 3,
      productId: 'p1',
      reason: MovementReason.VENTA,
    });
    expect(result.id).toBe('m-edge');
  });

  it('creates IN movement without transaction', async () => {
    const product = { id: 'p1', active: true, unitMeasure: UnitMeasure.UNIDADES } as Product;
    productRepo.findOne.mockResolvedValue(product);
    const movement = { id: 'm1' } as Movement;
    movementRepo.create.mockReturnValue(movement);
    movementRepo.save.mockResolvedValue(movement);

    const result = await service.create({
      type: MovementType.IN,
      quantity: 5,
      productId: 'p1',
      reason: MovementReason.COMPRA,
    });

    expect(result.id).toBe('m1');
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects decimal quantity for unidades product', async () => {
    const product = {
      id: 'p1',
      active: true,
      unitMeasure: UnitMeasure.UNIDADES,
    } as Product;
    productRepo.findOne.mockResolvedValue(product);

    await expect(
      service.create({
        type: MovementType.IN,
        quantity: 1.5,
        productId: 'p1',
        reason: MovementReason.COMPRA,
      }),
    ).rejects.toThrow('Cantidad entera positiva requerida');
  });

  it('uses decimal error message for kg', async () => {
    const product = {
      id: 'p3',
      active: true,
      unitMeasure: UnitMeasure.KG,
    } as Product;
    productRepo.findOne.mockResolvedValue(product);
    await expect(
      service.create({
        type: MovementType.IN,
        quantity: 0,
        productId: 'p3',
        reason: MovementReason.COMPRA,
      }),
    ).rejects.toThrow('Cantidad positiva con hasta 3 decimales');
  });

  it('accepts decimal quantity for kg product', async () => {
    const product = {
      id: 'p2',
      active: true,
      unitMeasure: UnitMeasure.KG,
    } as Product;
    productRepo.findOne.mockResolvedValue(product);
    const movement = { id: 'm2' } as Movement;
    movementRepo.create.mockReturnValue(movement);
    movementRepo.save.mockResolvedValue(movement);

    const result = await service.create({
      type: MovementType.IN,
      quantity: 2.5,
      productId: 'p2',
      reason: MovementReason.COMPRA,
    });
    expect(result.id).toBe('m2');
  });

  it('throws when product inactive', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(
      service.create({
        type: MovementType.IN,
        quantity: 1,
        productId: 'p1',
        reason: MovementReason.COMPRA,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll without filters only orders', async () => {
    await service.findAll({});
    expect(listQb.orderBy).toHaveBeenCalledWith('m.createdAt', 'DESC');
    expect(listQb.andWhere).not.toHaveBeenCalled();
  });

  it('findAll applies productId filter', async () => {
    await service.findAll({ productId: 'p1' });
    expect(listQb.andWhere).toHaveBeenCalledWith(
      'm.productId = :productId',
      { productId: 'p1' },
    );
  });

  it('findAll applies type and date filters', async () => {
    await service.findAll({
      type: MovementType.OUT,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    });
    expect(listQb.andWhere).toHaveBeenCalledTimes(3);
  });

  it('findOne returns movement', async () => {
    const movement = { id: 'm1' } as Movement;
    movementRepo.findOne.mockResolvedValue(movement);
    const result = await service.findOne('m1');
    expect(result.id).toBe('m1');
  });

  it('findOne throws when missing', async () => {
    movementRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
