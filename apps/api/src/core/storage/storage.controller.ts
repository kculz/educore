import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { StoreFileDto } from './dto/store-file.dto';
import { StorageService } from './storage.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Storage')
@ApiBearerAuth()
@Controller({ path: 'storage', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'storage.read' })
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('providers')
  listProviders() {
    return this.storageService.listProviders();
  }

  @Get()
  list(@Req() request: RequestWithContext) {
    return this.storageService.listObjects(request.platformContext?.tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.storageService.getObject(id);
  }

  @Post()
  @AccessScope({ productCode: 'platform', permission: 'storage.write' })
  save(@Req() request: RequestWithContext, @Body() dto: StoreFileDto) {
    return this.storageService.saveFile({
      tenantId: request.platformContext?.tenantId ?? '',
      filename: dto.filename,
      contentType: dto.contentType,
      buffer: Buffer.from(dto.base64, 'base64'),
    });
  }
}

