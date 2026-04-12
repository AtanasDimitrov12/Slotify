import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffBlockedSlotController } from './staff-blocked-slot.controller';
import { StaffBlockedSlot, StaffBlockedSlotSchema } from './staff-blocked-slot.schema';
import { StaffBlockedSlotService } from './staff-blocked-slot.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StaffBlockedSlot.name, schema: StaffBlockedSlotSchema }]),
  ],
  controllers: [StaffBlockedSlotController],
  providers: [StaffBlockedSlotService],
  exports: [StaffBlockedSlotService],
})
export class StaffBlockedSlotModule {}
