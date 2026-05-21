import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UnitMeasure } from '../common/enums';
import { Movement } from '../movements/entities/movement.entity';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let movementRepo: jest.Mocked<Repository<Movement>>;

  beforeEach(async () => {
    productRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Product>>;

    movementRepo = {
      count: jest.fn(),
    } as unknown as jest.Mocked<Repository<Movement>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(Movement), useValue: movementRepo },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('creates a product with defaults', async () => {
    const dto = {
      name: 'Tornillo',
      unitMeasure: UnitMeasure.UNIDADES,
      category: 'Ferretería',
      minStock: 10,
    };
    const created = { id: '1', ...dto, description: '', active: true } as Product;
    productRepo.create.mockReturnValue(created);
    productRepo.save.mockResolvedValue(created);

    const result = await service.create(dto);
    expect(result.active).toBe(true);
    expect(productRepo.save).toHaveBeenCalled();
  });

  it('throws when product not found', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deactivates product with movements', async () => {
    const product = {
      id: 'p1',
      name: 'X',
      active: true,
    } as Product;
    productRepo.findOne.mockResolvedValue(product);
    movementRepo.count.mockResolvedValue(3);
    productRepo.save.mockImplementation(async (p) => p as Product);

    const result = await service.deactivate('p1');
    expect(result.active).toBe(false);
    expect(movementRepo.count).toHaveBeenCalled();
  });
});
