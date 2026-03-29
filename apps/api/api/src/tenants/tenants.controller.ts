import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { CreateTenantDto } from './dto/create-tenant.dto';
import type { UpdateTenantDto } from './dto/update-tenant.dto';
import type { TenantsService } from './tenants.service';

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('me')
  getMyTenant(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Get(':id')
  getTenant(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (id !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto, @CurrentUser() user: JwtPayload) {
    if (id !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (id !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return this.tenantsService.remove(id);
  }
}
