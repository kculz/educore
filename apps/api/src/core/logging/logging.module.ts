import { Global, Module } from '@nestjs/common';

import { PlatformLoggerService } from './platform-logger.service';

@Global()
@Module({
  providers: [PlatformLoggerService],
  exports: [PlatformLoggerService],
})
export class LoggingModule {}

