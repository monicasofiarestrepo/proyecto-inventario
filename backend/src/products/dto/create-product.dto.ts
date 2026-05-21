import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { UnitMeasure } from '../../common/enums';
import { ValidateQuantityForUnit } from '../../common/validators/quantity-for-unit.validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(UnitMeasure)
  unitMeasure: UnitMeasure;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  @ValidateQuantityForUnit()
  minStock: number;
}
