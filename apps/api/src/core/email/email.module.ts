import { Global, Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [SharedModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
