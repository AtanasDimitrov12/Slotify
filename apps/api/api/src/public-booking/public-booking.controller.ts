import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreatePublicReservationDto } from '../reservations/dto/create-public-reservation.dto';
import { CreateReservationLockDto } from './dto/create-reservation-lock.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { PublicBookingService } from './public-booking.service';

@Controller('public/tenants/:slug')
export class PublicBookingController {
  constructor(private readonly publicBookingService: PublicBookingService) {}

  @Get('booking-options')
  getBookingOptions(@Param('slug') slug: string) {
    return this.publicBookingService.getBookingOptionsBySlug(slug);
  }

  @Get('availability')
  getAvailability(@Param('slug') slug: string, @Query() query: GetAvailabilityDto) {
    return this.publicBookingService.getAvailabilityBySlug(slug, query);
  }

  @Post('reservation-locks')
  createLock(@Param('slug') slug: string, @Body() body: CreateReservationLockDto) {
    return this.publicBookingService.createReservationLockBySlug(slug, body);
  }

  @Post('reservations')
  createReservation(@Param('slug') slug: string, @Body() body: CreatePublicReservationDto) {
    return this.publicBookingService.createReservationBySlug(slug, body);
  }
}
