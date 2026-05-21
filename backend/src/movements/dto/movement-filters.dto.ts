import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { MovementType } from '../../common/enums';

export class MovementFiltersDto {
  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsEnum(MovementType)
  @IsOptional()
  type?: MovementType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
