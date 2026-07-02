import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';

import { trimToUndefined } from '../helpers/text.helpers';

export function IsTrimmedString(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isTrimmedString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && trimToUndefined(value) !== undefined;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a non-empty string`;
        },
      },
    });
  };
}
