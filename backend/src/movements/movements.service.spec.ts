import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { MovementReason, MovementType } from '../common/enums';
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

  beforeEach(async () => {
    movementRepo = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
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
    const product = { id: 'p1', active: true } as Product;
    productRepo.findOne.mockResolvedValue(product);

    dataSource.transaction.mockImplementation(async (fn) => {
      const manager = {} as never;
      inventoryService.getStockForProduct.mockResolvedValue(5);
      return fn(manager);
    });

    await expect(
      service.create({
        type: MovementType.OUT,
        quantity: 10,
        productId: 'p1',
        reason: MovementReason.VENTA,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates IN movement without transaction', async () => {
    const product = { id: 'p1', active: true } as Product;
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
});
