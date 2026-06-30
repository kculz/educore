import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { PlatformConfigService } from '../../config/platform-config.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

export interface StoredFileInput {
  tenantId: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
}

@Injectable()
export class StorageService {
  constructor(
    private readonly config: PlatformConfigService,
    private readonly platformState: PlatformStateService,
  ) {}

  listProviders() {
    return [
      { code: 'local', active: true },
      { code: 'cloudinary', active: false },
      { code: 'firebase', active: false },
      { code: 'gcs', active: false },
      { code: 's3', active: false },
      { code: 'azure-blob', active: false },
    ];
  }

  saveFile(input: StoredFileInput) {
    const storageRoot = this.config.storageRoot;
    const tenantFolder = join(storageRoot, input.tenantId);
    const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(tenantFolder, `${Date.now()}-${safeFilename}`);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, input.buffer);

    return this.platformState.saveStorageObject({
      tenantId: input.tenantId,
      filename: input.filename,
      contentType: input.contentType,
      size: input.buffer.byteLength,
      path: filePath,
    });
  }

  getObject(id: string) {
    return this.platformState.getStorageObject(id);
  }

  listObjects(tenantId?: string) {
    return this.platformState.listStorageObjects(tenantId);
  }
}
