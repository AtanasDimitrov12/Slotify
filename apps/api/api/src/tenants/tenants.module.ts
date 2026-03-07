import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant, TenantSchema } from './tenant.schema';
import { AdminTenantsController } from './admin-tenants.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  controllers: [TenantsController, AdminTenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}