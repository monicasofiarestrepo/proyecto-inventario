import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UnitMeasure } from '../enums';
import { isValidQuantity, quantityValidationMessage } from '../quantity.util';

@ValidatorConstraint({ name: 'quantityForUnit', async: false })
export class QuantityForUnitConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const unit = (args.object as { unitMeasure?: UnitMeasure }).unitMeasure;
    if (unit === undefined || typeof value !== 'number') {
      return false;
    }
    return isValidQuantity(value, unit);
  }

  defaultMessage(args: ValidationArguments): string {
    const unit = (args.object as { unitMeasure?: UnitMeasure }).unitMeasure;
    if (!unit) {
      return 'Cantidad inválida para la unidad';
    }
    return quantityValidationMessage(unit);
  }
}

export function ValidateQuantityForUnit(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'quantityForUnit',
      target: object.constructor,
      propertyName,
      options,
      validator: QuantityForUnitConstraint,
    });
  };
}
