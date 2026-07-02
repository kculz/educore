import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { SendEmailNotificationDto } from './dto/send-email-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({ path: 'notifications', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'notifications.read' })
export class NotificationsController {
  constructor(
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  list(@CurrentTenantId() tenantId: string | null) {
    return this.notificationsService.list(tenantId ?? undefined);
  }

  @Post('email')
  @AccessScope({ productCode: 'platform', permission: 'notifications.write' })
  @ApiBody({ type: SendEmailNotificationDto })
  sendEmail(@CurrentTenantId() tenantId: string | null, @Body() dto: SendEmailNotificationDto) {
    return this.notificationsService.sendEmail(tenantId ?? '', dto);
  }
}
