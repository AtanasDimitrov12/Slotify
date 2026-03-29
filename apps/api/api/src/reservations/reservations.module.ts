import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './reservation.schema';
import { ReservationLock, ReservationLockSchema } from './reservation-lock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: ReservationLock.name, schema: ReservationLockSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ReservationsModule {}
