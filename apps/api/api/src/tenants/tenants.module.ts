import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './tenant.schema';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PublicTenantsController } from './public-tenants.controller';
import { AdminTenantsController } from './admin-tenants.controller';
import { BookingSettingsModule } from '../booking-settings/booking-settings.module';
import { TenantDetailsModule } from '../tenant-details/tenant-details.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
    ]),
    BookingSettingsModule,
    TenantDetailsModule,
  ],
  controllers: [TenantsController, PublicTenantsController, AdminTenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}