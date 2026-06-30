import { Module } from '@nestjs/common';

import { PlatformStateModule } from '../platform-state/platform-state.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [PlatformStateModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

