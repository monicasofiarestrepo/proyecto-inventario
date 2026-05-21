import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';

import { MovementReason, MovementType } from '../../common/enums';

export class CreateMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUUID()
  productId: string;

  @IsEnum(MovementReason)
  reason: MovementReason;
}
