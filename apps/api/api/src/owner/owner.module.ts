import { Module } from '@nestjs/common';
import { TenantDetailsModule } from '../tenant-details/tenant-details.module';
import { TenantsModule } from '../tenants/tenants.module';
import { OwnerSettingsController } from './owner-settings.controller';
import { OwnerSettingsService } from './owner-settings.service';

@Module({
  imports: [TenantsModule, TenantDetailsModule],
  controllers: [OwnerSettingsController],
  providers: [OwnerSettingsService],
})
export class OwnerModule {}
