import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffAvailability, StaffAvailabilitySchema } from './staff-availability.schema';
import { StaffAvailabilityService } from './staff-availability.service';
import { StaffAvailabilityController } from './staff-availability.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffAvailability.name, schema: StaffAvailabilitySchema },
    ]),
  ],
  controllers: [StaffAvailabilityController],
  providers: [StaffAvailabilityService],
  exports: [StaffAvailabilityService],
})
export class StaffAvailabilityModule {}