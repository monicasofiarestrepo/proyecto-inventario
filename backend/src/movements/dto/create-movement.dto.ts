import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';

import { MovementReason, MovementType } from '../../common/enums';

export class CreateMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(0.000001)
  quantity: number;

  @IsUUID()
  productId: string;

  @IsEnum(MovementReason)
  reason: MovementReason;
}
