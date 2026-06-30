import 'reflect-metadata';

import compression from 'compression';
import helmet from 'helmet';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { PlatformConfigService } from './config/platform-config.service';
import { PlatformLoggerService } from './core/logging/platform-logger.service';
import { PlatformValidationService } from './shared/validation/platform-validation.service';
import { PlatformExceptionFilter } from './shared/errors/platform-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const platformConfig = app.get(PlatformConfigService);
  const logger = app.get(PlatformLoggerService);
  const validation = app.get(PlatformValidationService);
  const exceptionFilter = app.get(PlatformExceptionFilter);

  app.useLogger(logger);
  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(validation.createPipe());
  app.useGlobalFilters(exceptionFilter);

  const swaggerConfig = new DocumentBuilder()
    .setTitle(platformConfig.appName)
    .setDescription('EduCore platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(platformConfig.apiPort, '0.0.0.0');
}

void bootstrap();
