import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { PreviewEmailDto } from './dto/preview-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailService } from './email.service';

@ApiTags('Email')
@ApiBearerAuth()
@Controller({ path: 'emails', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'emails.write' })
export class EmailController {
  constructor(@Inject(EmailService) private readonly emailService: EmailService) {}

  @Post('preview')
  @ApiBody({ type: PreviewEmailDto })
  preview(@Body() body: PreviewEmailDto) {
    return this.emailService.preview(body.template, body.payload);
  }

  @Post('send')
  @ApiBody({ type: SendEmailDto })
  send(@CurrentTenantId() tenantId: string | null, @Body() body: SendEmailDto) {
    return this.emailService.sendTemplatedEmail({
      tenantId: tenantId ?? '',
      to: body.to,
      template: body.template,
      payload: body.payload,
    });
  }
}
