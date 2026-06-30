import { Module } from '@nestjs/common';

import { EmailModule } from './email.module';
import { EmailController } from './email.controller';

@Module({
  imports: [EmailModule],
  controllers: [EmailController],
})
export class EmailAdminModule {}

