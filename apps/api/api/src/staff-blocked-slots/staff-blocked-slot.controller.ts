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
import { CreateStaffBlockedSlotDto, UpdateStaffBlockedSlotDto } from './dto/staff-blocked-slot.dto';
import { StaffBlockedSlotService } from './staff-blocked-slot.service';

@Controller('staff-blocked-slots')
@UseGuards(JwtAuthGuard)
export class StaffBlockedSlotController {
  constructor(private readonly blockedSlotService: StaffBlockedSlotService) {}

  private getTenantId(currentUser: JwtPayload): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    return tenantId;
  }

  @Get('me')
  findMySlots(@CurrentUser() user: JwtPayload, @Query('includeInactive') includeInactive?: string) {
    return this.blockedSlotService.findAllByStaff(user.sub, includeInactive === 'true');
  }

  @Post('me')
  createMySlot(
    @CurrentUser() user: JwtPayload,
    @Body() dto: Omit<CreateStaffBlockedSlotDto, 'tenantId' | 'userId'>,
  ) {
    return this.blockedSlotService.create({
      ...dto,
      tenantId: this.getTenantId(user),
      userId: user.sub,
    } as CreateStaffBlockedSlotDto);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStaffBlockedSlotDto) {
    // Ensure user is only creating for themselves if not owner
    if (user.role !== 'owner' && user.sub !== dto.userId) {
      throw new UnauthorizedException('You can only block your own slots');
    }
    return this.blockedSlotService.create(dto);
  }

  @Get()
  findAllByStaff(
    @CurrentUser() user: JwtPayload,
    @Query('userId') userId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    if (user.role !== 'owner' && user.sub !== userId) {
      throw new UnauthorizedException('Access denied');
    }
    return this.blockedSlotService.findAllByStaff(userId, includeInactive === 'true');
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStaffBlockedSlotDto,
  ) {
    // In a real app we'd verify ownership of the record
    return this.blockedSlotService.update(id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    // In a real app we'd verify ownership of the record
    return this.blockedSlotService.remove(id);
  }
}
