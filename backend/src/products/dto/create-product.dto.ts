import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { UnitMeasure } from '../../common/enums';

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

  @IsInt()
  @Min(0)
  minStock: number;
}
