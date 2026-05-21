import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UnitMeasure } from '../common/enums';
import {
  isValidQuantity,
  normalizeQuantity,
  quantityValidationMessage,
} from '../common/quantity.util';
import { Movement } from '../movements/entities/movement.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Movement)
    private readonly movementRepo: Repository<Movement>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    this.assertMinStock(dto.minStock, dto.unitMeasure);
    const product = this.productRepo.create({
      ...dto,
      minStock: normalizeQuantity(dto.minStock, dto.unitMeasure),
      description: dto.description ?? '',
      active: true,
    });
    return this.productRepo.save(product);
  }

  async findAllActive(): Promise<Product[]> {
    return this.productRepo.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const unit = dto.unitMeasure ?? product.unitMeasure;
    if (dto.minStock !== undefined) {
      this.assertMinStock(dto.minStock, unit);
      dto.minStock = normalizeQuantity(dto.minStock, unit);
    }
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  private assertMinStock(minStock: number, unit: UnitMeasure): void {
    if (!isValidQuantity(minStock, unit)) {
      throw new BadRequestException(quantityValidationMessage(unit));
    }
  }

  async deactivate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    await this.movementRepo.count({ where: { productId: id } });
    product.active = false;
    return this.productRepo.save(product);
  }
}
