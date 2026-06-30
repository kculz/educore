import { Injectable, ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';

@Injectable()
export class PlatformValidationService {
  createPipe(overrides: ValidationPipeOptions = {}) {
    return new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      ...overrides,
    });
  }
}

