import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

export interface FileUploadInput {
  filename: string;
  contentType: string;
  buffer: Buffer;
}

export interface FileUploadDescriptor {
  originalName: string;
  safeName: string;
  contentType: string;
  size: number;
  checksum: string;
  extension: string;
}

@Injectable()
export class FileUploadService {
  describe(input: FileUploadInput): FileUploadDescriptor {
    const safeName = this.buildSafeFilename(input.filename);
    return {
      originalName: input.filename,
      safeName,
      contentType: input.contentType,
      size: input.buffer.byteLength,
      checksum: createHash('sha256').update(input.buffer).digest('hex'),
      extension: this.getExtension(input.filename),
    };
  }

  sanitizeFilename(filename: string) {
    const trimmed = filename.trim().replace(/\s+/g, '_');
    const sanitized = trimmed
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/_+\./g, '.');
    return sanitized || 'file';
  }

  buildSafeFilename(filename: string) {
    return `${Date.now()}-${this.sanitizeFilename(filename)}`;
  }

  private getExtension(filename: string) {
    const match = /\.([^.]+)$/.exec(filename.trim());
    return match ? match[1].toLowerCase() : '';
  }
}
