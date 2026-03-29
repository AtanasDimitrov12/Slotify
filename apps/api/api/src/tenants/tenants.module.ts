import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSettingsModule } from '../booking-settings/booking-settings.module';
import { TenantDetailsModule } from '../tenant-details/tenant-details.module';
import { AdminTenantsController } from './admin-tenants.controller';
import { PublicTenantsController } from './public-tenants.controller';
import { Tenant, TenantSchema } from './tenant.schema';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    BookingSettingsModule,
    TenantDetailsModule,
  ],
  controllers: [TenantsController, PublicTenantsController, AdminTenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
