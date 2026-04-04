import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerProfile, CustomerProfileSchema } from './customer-profile.schema';
import { CustomerProfilesController } from './customer-profiles.controller';
import { CustomerProfilesService } from './customer-profiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CustomerProfile.name, schema: CustomerProfileSchema }]),
  ],
  controllers: [CustomerProfilesController],
  providers: [CustomerProfilesService],
  exports: [CustomerProfilesService],
})
export class CustomerProfilesModule {}
