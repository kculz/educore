import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  it('sanitizes filenames and generates a checksum', () => {
    const service = new FileUploadService();
    const descriptor = service.describe({
      filename: 'Exam Sheet (Final).pdf',
      contentType: 'application/pdf',
      buffer: Buffer.from('educore'),
    });

    expect(descriptor.originalName).toBe('Exam Sheet (Final).pdf');
    expect(descriptor.safeName).toContain('Exam_Sheet_Final.pdf');
    expect(descriptor.checksum).toHaveLength(64);
    expect(descriptor.extension).toBe('pdf');
  });
});

