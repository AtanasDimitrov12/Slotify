import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerProfile, CustomerProfileSchema } from './customer-profile.schema';
import { CustomerProfilesService } from './customer-profiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CustomerProfile.name, schema: CustomerProfileSchema }]),
  ],
  providers: [CustomerProfilesService],
  exports: [CustomerProfilesService],
})
export class CustomerProfilesModule {}
