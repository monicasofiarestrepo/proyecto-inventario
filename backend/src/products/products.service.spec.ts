import { BadRequestException, NotFoundException } from '@nestjs/common';
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

  it('creates a product with empty description default', async () => {
    const dto = {
      name: 'Tornillo',
      unitMeasure: UnitMeasure.UNIDADES,
      category: 'Ferretería',
      minStock: 10,
    };
    const created = { id: '1', ...dto, description: '', active: true } as Product;
    productRepo.create.mockImplementation((x) => x as Product);
    productRepo.save.mockResolvedValue(created);

    await service.create(dto);
    expect(productRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: '', active: true, minStock: 10 }),
    );
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

  it('rejects decimal minStock for unidades', async () => {
    const dto = {
      name: 'Harina',
      unitMeasure: UnitMeasure.UNIDADES,
      category: 'Almacén',
      minStock: 2.5,
    };
    await expect(service.create(dto)).rejects.toThrow('entero');
  });

  it('findAllActive returns sorted products', async () => {
    const list = [{ id: '1', name: 'A', active: true }] as Product[];
    productRepo.find.mockResolvedValue(list);
    const result = await service.findAllActive();
    expect(result).toEqual(list);
    expect(productRepo.find).toHaveBeenCalledWith({
      where: { active: true },
      order: { name: 'ASC' },
    });
  });

  it('findOne returns product', async () => {
    const product = { id: '1', name: 'X' } as Product;
    productRepo.findOne.mockResolvedValue(product);
    const result = await service.findOne('1');
    expect(result.name).toBe('X');
  });

  it('throws when product not found', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates minStock for kg with decimals', async () => {
    const product = {
      id: 'p1',
      name: 'Harina',
      unitMeasure: UnitMeasure.KG,
      category: 'Almacen',
      minStock: 1,
      active: true,
    } as Product;
    productRepo.findOne.mockResolvedValue(product);
    productRepo.save.mockImplementation(async (p) => p as Product);

    const result = await service.update('p1', { minStock: 2.5 });
    expect(result.minStock).toBe(2.5);
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

  it('deactivates product without movements', async () => {
    const product = { id: 'p2', name: 'Y', active: true } as Product;
    productRepo.findOne.mockResolvedValue(product);
    movementRepo.count.mockResolvedValue(0);
    productRepo.save.mockImplementation(async (p) => p as Product);

    const result = await service.deactivate('p2');
    expect(result.active).toBe(false);
  });
});
