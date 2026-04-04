import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CustomerProfilesService } from '../customer-profiles/customer-profiles.service';
import { CustomerReservationsService } from './customer-reservations.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('customer-reservations')
@UseGuards(JwtAuthGuard)
export class CustomerReservationsController {
  constructor(
    private readonly customerReservationsService: CustomerReservationsService,
    private readonly customerProfilesService: CustomerProfilesService,
  ) {}

  @Get()
  async getMyReservations(@CurrentUser() user: JwtPayload) {
    const profile = await this.customerProfilesService.findByUserId(user.sub);
    return this.customerReservationsService.findAllByContact(user.email, profile?.phone);
  }

  @Patch(':id/cancel')
  async cancelReservation(@Param('id') reservationId: string, @CurrentUser() user: JwtPayload) {
    const profile = await this.customerProfilesService.findByUserId(user.sub);
    return this.customerReservationsService.cancelReservation(reservationId, user.email, profile?.phone);
  }

  @Post(':id/review')
  async addReview(
    @Param('id') reservationId: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const profile = await this.customerProfilesService.findByUserId(user.sub);
    return this.customerReservationsService.addReview(reservationId, dto, user.email, profile?.phone);
  }
}
