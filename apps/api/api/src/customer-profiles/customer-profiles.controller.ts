import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomerProfilesService } from './customer-profiles.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Controller('customer-profiles')
@UseGuards(JwtAuthGuard)
export class CustomerProfilesController {
  constructor(private readonly customerProfilesService: CustomerProfilesService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.customerProfilesService.getOrCreateByUserId(user.sub);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCustomerProfileDto) {
    return this.customerProfilesService.updateByUserId(user.sub, dto);
  }
}
