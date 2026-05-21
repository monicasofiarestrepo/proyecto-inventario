import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { MovementType } from '../common/enums';
import {
  isPositiveQuantity,
  normalizeQuantity,
  quantityValidationMessage,
} from '../common/quantity.util';
import { InventoryService } from '../inventory/inventory.service';
import { Product } from '../products/entities/product.entity';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementFiltersDto } from './dto/movement-filters.dto';
import { Movement } from './entities/movement.entity';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepo: Repository<Movement>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateMovementDto): Promise<Movement> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId, active: true },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado o inactivo');
    }

    if (!isPositiveQuantity(dto.quantity, product.unitMeasure)) {
      throw new BadRequestException(
        product.unitMeasure === 'unidades'
          ? 'Cantidad entera positiva requerida'
          : 'Cantidad positiva con hasta 3 decimales',
      );
    }
    dto.quantity = normalizeQuantity(dto.quantity, product.unitMeasure);

    if (dto.type === MovementType.OUT) {
      return this.dataSource.transaction(async (manager) => {
        const stock = await this.inventoryService.getStockForProduct(
          dto.productId,
          manager,
        );
        if (dto.quantity > stock) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${stock}`,
          );
        }
        const movement = manager.create(Movement, dto);
        return manager.save(Movement, movement);
      });
    }

    const movement = this.movementRepo.create(dto);
    return this.movementRepo.save(movement);
  }

  async findAll(filters: MovementFiltersDto): Promise<Movement[]> {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'product')
      .orderBy('m.createdAt', 'DESC');

    if (filters.productId) {
      qb.andWhere('m.productId = :productId', { productId: filters.productId });
    }
    if (filters.type) {
      qb.andWhere('m.type = :type', { type: filters.type });
    }
    if (filters.startDate) {
      qb.andWhere('m.createdAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('m.createdAt <= :endDate', { endDate: end });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Movement> {
    const movement = await this.movementRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!movement) {
      throw new NotFoundException(`Movimiento ${id} no encontrado`);
    }
    return movement;
  }
}
