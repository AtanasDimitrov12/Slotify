import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTicketDto) {
    if (!user.tenantId) throw new Error('Tenant ID required');
    return this.ticketsService.create(user.tenantId, user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('stage') stage?: string,
    @Query('search') search?: string,
  ) {
    // If admin, they can see all tickets (tenantId: undefined)
    // If not admin, they are restricted to their own tenant
    const tenantId = user.role === 'admin' ? undefined : user.tenantId;

    if (!tenantId && user.role !== 'admin') {
      throw new Error('Tenant ID required for non-admin users');
    }

    return this.ticketsService.findAll(tenantId, { stage, search });
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const tenantId = user.role === 'admin' ? undefined : user.tenantId;
    return this.ticketsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateTicketDto) {
    const tenantId = user.role === 'admin' ? undefined : user.tenantId;
    return this.ticketsService.update(tenantId, id, dto);
  }

  @Post(':id/start')
  start(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const tenantId = user.role === 'admin' ? undefined : user.tenantId;
    return this.ticketsService.start(tenantId, id);
  }

  @Post(':id/finish')
  finish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const tenantId = user.role === 'admin' ? undefined : user.tenantId;
    return this.ticketsService.finish(tenantId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const tenantId = user.role === 'admin' ? undefined : user.tenantId;
    return this.ticketsService.remove(tenantId, id);
  }
}
