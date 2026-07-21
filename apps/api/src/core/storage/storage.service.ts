import { Injectable } from '@nestjs/common';

import { PlatformStateService } from '../platform-state/platform-state.service';
import { StorageProviderService } from '../../shared/storage/storage-provider.service';

export interface StoredFileInput {
  tenantId: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
}

@Injectable()
export class StorageService {
  constructor(
    private readonly storageProvider: StorageProviderService,
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
    const stored = this.storageProvider.save(input);

    return this.platformState.saveStorageObject({
      tenantId: input.tenantId,
      filename: input.filename,
      contentType: input.contentType,
      size: input.buffer.byteLength,
      path: stored.path,
    });
  }

  getObject(id: string) {
    return this.platformState.getStorageObject(id);
  }

  listObjects(tenantId?: string) {
    return this.platformState.listStorageObjects(tenantId);
  }
}
