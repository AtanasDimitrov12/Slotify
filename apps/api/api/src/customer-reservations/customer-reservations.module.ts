import { Module } from '@nestjs/common';
import { CustomerProfilesModule } from '../customer-profiles/customer-profiles.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { CustomerReservationsController } from './customer-reservations.controller';
import { CustomerReservationsService } from './customer-reservations.service';

@Module({
  imports: [ReservationsModule, CustomerProfilesModule],
  controllers: [CustomerReservationsController],
  providers: [CustomerReservationsService],
})
export class CustomerReservationsModule {}
