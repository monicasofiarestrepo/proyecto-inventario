import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    const product = this.productRepo.create({
      ...dto,
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
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async deactivate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    const movementCount = await this.movementRepo.count({
      where: { productId: id },
    });

    if (movementCount > 0) {
      product.active = false;
      return this.productRepo.save(product);
    }

    product.active = false;
    return this.productRepo.save(product);
  }
}
