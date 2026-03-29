import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffProfile, StaffProfileSchema } from './staff-profile.schema';
import { StaffProfilesController } from './staff-profiles.controller';
import { StaffProfilesService } from './staff-profiles.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: StaffProfile.name, schema: StaffProfileSchema }])],
  controllers: [StaffProfilesController],
  providers: [StaffProfilesService],
  exports: [StaffProfilesService],
})
export class StaffProfilesModule {}
