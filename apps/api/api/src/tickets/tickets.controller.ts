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
    return this.ticketsService.create(user.tenantId, user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('stage') stage?: string,
    @Query('search') search?: string,
  ) {
    if (user.role === 'admin') {
      return this.ticketsService.findAll(undefined, { stage, search });
    }

    if (user.role === 'customer') {
      // Customers see their own tickets, regardless of tenantId
      return this.ticketsService.findAll(user.tenantId, {
        stage,
        search,
        requestedBy: user.sub,
      });
    }

    // Owners and Staff must have a tenantId
    if (!user.tenantId) {
      throw new Error('Tenant ID required');
    }

    return this.ticketsService.findAll(user.tenantId, { stage, search });
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (user.role === 'admin') {
      return this.ticketsService.findOne(undefined, id);
    }
    const requestedBy = user.role === 'customer' ? user.sub : undefined;
    return this.ticketsService.findOne(user.tenantId, id, requestedBy);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    if (user.role === 'admin') {
      return this.ticketsService.update(undefined, id, dto);
    }
    const requestedBy = user.role === 'customer' ? user.sub : undefined;
    return this.ticketsService.update(user.tenantId, id, dto, requestedBy);
  }

  @Post(':id/start')
  start(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (user.role === 'admin') {
      return this.ticketsService.start(undefined, id);
    }
    const requestedBy = user.role === 'customer' ? user.sub : undefined;
    return this.ticketsService.start(user.tenantId, id, requestedBy);
  }

  @Post(':id/finish')
  finish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (user.role === 'admin') {
      return this.ticketsService.finish(undefined, id);
    }
    const requestedBy = user.role === 'customer' ? user.sub : undefined;
    return this.ticketsService.finish(user.tenantId, id, requestedBy);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (user.role === 'admin') {
      return this.ticketsService.remove(undefined, id);
    }
    const requestedBy = user.role === 'customer' ? user.sub : undefined;
    return this.ticketsService.remove(user.tenantId, id, requestedBy);
  }
}
