import { Module } from '@nestjs/common';
import { OwnerSettingsController } from './owner-settings.controller';
import { OwnerSettingsService } from './owner-settings.service';
import { TenantsModule } from '../tenants/tenants.module';
import { TenantDetailsModule } from '../tenant-details/tenant-details.module';

@Module({
  imports: [TenantsModule, TenantDetailsModule],
  controllers: [OwnerSettingsController],
  providers: [OwnerSettingsService],
})
export class OwnerModule {}