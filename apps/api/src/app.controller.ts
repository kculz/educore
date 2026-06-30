import { Controller, Get } from '@nestjs/common';

import { AnonymousRoute } from './core/platform-access/platform-access.decorator';
import { AppService } from './app.service';

@Controller({ path: '', version: '1' })
@AnonymousRoute()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }
}
