import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { SendEmailNotificationDto } from './dto/send-email-notification.dto';
import { NotificationsService } from './notifications.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({ path: 'notifications', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'notifications.read' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Req() request: RequestWithContext) {
    return this.notificationsService.list(request.platformContext?.tenantId);
  }

  @Post('email')
  @AccessScope({ productCode: 'platform', permission: 'notifications.write' })
  sendEmail(@Req() request: RequestWithContext, @Body() dto: SendEmailNotificationDto) {
    return this.notificationsService.sendEmail(request.platformContext?.tenantId ?? '', dto);
  }
}

