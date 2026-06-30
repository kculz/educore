import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { PlatformConfigService } from '../../config/platform-config.service';
import { FileUploadDescriptor, FileUploadInput, FileUploadService } from '../files/file-upload.service';

export interface StorageWriteInput extends FileUploadInput {
  tenantId: string;
}

export interface StorageWriteResult extends FileUploadDescriptor {
  tenantId: string;
  path: string;
}

@Injectable()
export class StorageProviderService {
  constructor(
    private readonly config: PlatformConfigService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  save(input: StorageWriteInput): StorageWriteResult {
    const descriptor = this.fileUploadService.describe(input);
    const tenantFolder = join(this.config.storageRoot, input.tenantId);
    const path = join(tenantFolder, descriptor.safeName);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, input.buffer);

    return {
      tenantId: input.tenantId,
      path,
      ...descriptor,
    };
  }

  getRoot() {
    return this.config.storageRoot;
  }
}

