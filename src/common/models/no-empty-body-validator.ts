import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NoEmptyBody', async: false })
@Injectable()
export class NoEmptyBodyRule implements ValidatorConstraintInterface {
  constructor() {}

  validate(field: never, args: ValidationArguments) {
    const { object } = args;
    return Object.entries(object).some(([key, value]) => {
      return !key.startsWith('_') && value !== undefined;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return 'No empty body';
  }
}
