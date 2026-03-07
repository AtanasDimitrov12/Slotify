import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffTimeOff, StaffTimeOffSchema } from './staff-time-off.schema';
import { StaffTimeOffService } from './staff-time-off.service';
import { StaffTimeOffController } from './staff-time-off.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StaffTimeOff.name, schema: StaffTimeOffSchema },
    ]),
  ],
  controllers: [StaffTimeOffController],
  providers: [StaffTimeOffService],
  exports: [StaffTimeOffService],
})
export class StaffTimeOffModule {}