import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { StagesService } from './stages.service';

@UseGuards(JwtAuthGuard)
@Controller('ticket-stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    if (!user.tenantId) throw new Error('Tenant ID required');
    return this.stagesService.findAll(user.tenantId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStageDto) {
    if (!user.tenantId) throw new Error('Tenant ID required');
    return this.stagesService.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
  ) {
    if (!user.tenantId) throw new Error('Tenant ID required');
    return this.stagesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    if (!user.tenantId) throw new Error('Tenant ID required');
    return this.stagesService.remove(user.tenantId, id);
  }

  @Put('order')
  updateOrder(
    @CurrentUser() user: JwtPayload,
    @Body() stageOrders: { id: string; order: number }[],
  ) {
    if (!user.tenantId) throw new Error('Tenant ID required');
    return this.stagesService.updateOrder(user.tenantId, stageOrders);
  }
}
