import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStaffTimeOffDto } from './dto/create-staff-time-off.dto';
import { UpdateStaffTimeOffDto } from './dto/update-staff-time-off.dto';
import { StaffTimeOffService } from './staff-time-off.service';

@Controller('staff-time-off')
@UseGuards(JwtAuthGuard)
export class StaffTimeOffController {
  constructor(private readonly staffTimeOffService: StaffTimeOffService) {}

  private getTenantId(currentUser: JwtPayload): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    return tenantId;
  }

  private validateUserId(userId: string) {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user id');
    }
  }

  private ensureOwner(currentUser: JwtPayload) {
    if (!['owner'].includes(currentUser?.role ?? '')) {
      throw new UnauthorizedException('You are not allowed to manage staff time off');
    }
  }

  @Post()
  create(@Body() dto: CreateStaffTimeOffDto) {
    return this.staffTimeOffService.create(dto);
  }

  @Get()
  findAllByStaff(@Query('tenantId') tenantId: string, @Query('userId') userId: string) {
    return this.staffTimeOffService.findAllByStaff(tenantId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffTimeOffDto) {
    return this.staffTimeOffService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffTimeOffService.remove(id);
  }

  @Get('owner/pending-counts')
  getPendingCounts(@CurrentUser() currentUser: JwtPayload) {
    this.ensureOwner(currentUser);
    return this.staffTimeOffService.getPendingCountsByTenant(this.getTenantId(currentUser));
  }

  @Get('owner/staff/:userId')
  getAllForOwnerByStaff(@CurrentUser() currentUser: JwtPayload, @Param('userId') userId: string) {
    this.ensureOwner(currentUser);
    this.validateUserId(userId);

    return this.staffTimeOffService.findAllForOwnerByStaff(this.getTenantId(currentUser), userId);
  }

  @Patch('owner/:requestId/status')
  reviewRequest(
    @CurrentUser() currentUser: JwtPayload,
    @Param('requestId') requestId: string,
    @Body() body: { status: 'approved' | 'denied' },
  ) {
    this.ensureOwner(currentUser);

    return this.staffTimeOffService.reviewRequest(
      this.getTenantId(currentUser),
      requestId,
      body.status,
    );
  }
}
