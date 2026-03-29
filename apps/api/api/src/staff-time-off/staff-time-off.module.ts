import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffTimeOffController } from './staff-time-off.controller';
import { StaffTimeOff, StaffTimeOffSchema } from './staff-time-off.schema';
import { StaffTimeOffService } from './staff-time-off.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: StaffTimeOff.name, schema: StaffTimeOffSchema }])],
  controllers: [StaffTimeOffController],
  providers: [StaffTimeOffService],
  exports: [StaffTimeOffService],
})
export class StaffTimeOffModule {}
