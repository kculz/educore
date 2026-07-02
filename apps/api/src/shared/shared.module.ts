import { Global, Module } from '@nestjs/common';

import { BackgroundJobsService } from './jobs/background-jobs.service';
import { CsvExportService } from './export/csv-export.service';
import { EmailTemplateService } from './email/email-template.service';
import { FileUploadService } from './files/file-upload.service';
import { FilteringService } from './query/filtering.service';
import { PaginationService } from './query/pagination.service';
import { PlatformCacheService } from './cache/platform-cache.service';
import { PlatformExceptionFilter } from './errors/platform-exception.filter';
import { PlatformUtilityService } from './utilities/platform-utility.service';
import { PdfExportService } from './export/pdf-export.service';
import { ResponseFormatterService } from './formatting/response-formatter.service';
import { SearchService } from './query/search.service';
import { NotificationProviderService } from './notifications/notification-provider.service';
import { SortingService } from './query/sorting.service';
import { RequestTimingInterceptor } from './interceptors/request-timing.interceptor';
import { PlatformValidationService } from './validation/platform-validation.service';
import { StorageProviderService } from './storage/storage-provider.service';

const providers = [
  PlatformUtilityService,
  PlatformCacheService,
  PaginationService,
  FilteringService,
  SearchService,
  SortingService,
  CsvExportService,
  PdfExportService,
  FileUploadService,
  StorageProviderService,
  EmailTemplateService,
  NotificationProviderService,
  BackgroundJobsService,
  PlatformValidationService,
  RequestTimingInterceptor,
  ResponseFormatterService,
  PlatformExceptionFilter,
];

@Global()
@Module({
  providers,
  exports: providers,
})
export class SharedModule {}
