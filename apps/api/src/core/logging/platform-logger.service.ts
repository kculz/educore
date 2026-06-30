import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';

import { PlatformConfigService } from '../../config/platform-config.service';

@Injectable()
export class PlatformLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor(private readonly config: PlatformConfigService) {
    this.logger = createLogger({
      level: this.config.logLevel,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [new transports.Console()],
    });
  }

  log(message: unknown, context?: string) {
    this.logger.info(this.stringify(message), { context });
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error(this.stringify(message), { trace, context });
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(this.stringify(message), { context });
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(this.stringify(message), { context });
  }

  verbose(message: unknown, context?: string) {
    this.logger.verbose(this.stringify(message), { context });
  }

  private stringify(message: unknown) {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }
}
