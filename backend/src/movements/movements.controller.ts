import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementFiltersDto } from './dto/movement-filters.dto';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  create(@Body() dto: CreateMovementDto) {
    return this.movementsService.create(dto);
  }

  @Get()
  findAll(@Query() filters: MovementFiltersDto) {
    return this.movementsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.movementsService.findOne(id);
  }
}
