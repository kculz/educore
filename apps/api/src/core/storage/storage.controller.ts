import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { StoreFileDto } from './dto/store-file.dto';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@ApiBearerAuth()
@Controller({ path: 'storage', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'storage.read' })
export class StorageController {
  constructor(@Inject(StorageService) private readonly storageService: StorageService) {}

  @Get('providers')
  listProviders() {
    return this.storageService.listProviders();
  }

  @Get()
  list(@CurrentTenantId() tenantId: string | null) {
    return this.storageService.listObjects(tenantId ?? undefined);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.storageService.getObject(id);
  }

  @Post()
  @AccessScope({ productCode: 'platform', permission: 'storage.write' })
  @ApiBody({ type: StoreFileDto })
  save(@CurrentTenantId() tenantId: string | null, @Body() dto: StoreFileDto) {
    return this.storageService.saveFile({
      tenantId: tenantId ?? '',
      filename: dto.filename,
      contentType: dto.contentType,
      buffer: Buffer.from(dto.base64, 'base64'),
    });
  }
}
