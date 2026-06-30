import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlatformConfigModule } from './config/platform-config.module';
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { AuditModule } from './core/audit/audit.module';
import { DashboardModule } from './core/dashboard/dashboard.module';
import { EmailAdminModule } from './core/email/email.admin.module';
import { EmailModule } from './core/email/email.module';
import { FeatureFlagsModule } from './core/feature-flags/feature-flags.module';
import { HealthModule } from './core/health/health.module';
import { LicensingModule } from './core/licensing/licensing.module';
import { LoggingModule } from './core/logging/logging.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { PermissionsModule } from './core/permissions/permissions.module';
import { PlatformAccessGuard } from './core/platform-access/platform-access.guard';
import { PlatformStateModule } from './core/platform-state/platform-state.module';
import { ProductsModule } from './core/products/products.module';
import { QueuesAdminModule } from './core/queues/queues.admin.module';
import { QueuesModule } from './core/queues/queues.module';
import { ReportingModule } from './core/reporting/reporting.module';
import { RolesModule } from './core/roles/roles.module';
import { SettingsModule } from './core/settings/settings.module';
import { StorageAdminModule } from './core/storage/storage.admin.module';
import { StorageModule } from './core/storage/storage.module';
import { TenantsModule } from './core/tenants/tenants.module';
import { UsersModule } from './core/users/users.module';
import { AdmissionModule } from './products/admission/admission.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    PlatformConfigModule,
    PlatformStateModule,
    SharedModule,
    LoggingModule,
    QueuesModule,
    EmailModule,
    StorageModule,
    AuthModule,
    HealthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ProductsModule,
    AdmissionModule,
    LicensingModule,
    FeatureFlagsModule,
    AuditModule,
    NotificationsModule,
    SettingsModule,
    DashboardModule,
    ReportingModule,
    QueuesAdminModule,
    StorageAdminModule,
    EmailAdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PlatformAccessGuard,
    },
  ],
})
export class AppModule {}
