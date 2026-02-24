import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantDetailsController } from './tenant-details.controller';
import { TenantDetails, TenantDetailsSchema } from './tenant-details.schema';
import { TenantDetailsService } from './tenant-details.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TenantDetails.name, schema: TenantDetailsSchema }]),
  ],
  controllers: [TenantDetailsController],
  providers: [TenantDetailsService],
  exports: [TenantDetailsService],
})
export class TenantDetailsModule {}