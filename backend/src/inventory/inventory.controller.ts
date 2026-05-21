import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('alerts/low-stock')
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get(':productId')
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.findByProductId(productId);
  }
}
