import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { PreviewEmailDto } from './dto/preview-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailService } from './email.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Email')
@ApiBearerAuth()
@Controller({ path: 'emails', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'emails.write' })
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('preview')
  preview(@Body() body: PreviewEmailDto) {
    return this.emailService.preview(body.template, body.payload);
  }

  @Post('send')
  send(@Req() request: RequestWithContext, @Body() body: SendEmailDto) {
    return this.emailService.sendTemplatedEmail({
      tenantId: request.platformContext?.tenantId ?? '',
      to: body.to,
      template: body.template,
      payload: body.payload,
    });
  }
}
