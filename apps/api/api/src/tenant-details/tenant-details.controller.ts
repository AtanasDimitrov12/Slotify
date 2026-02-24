import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateTenantDetailsDto } from './dto/create-tenant-details.dto';
import { UpdateTenantDetailsDto } from './dto/update-tenant-details.dto';
import { TenantDetailsService } from './tenant-details.service';

@Controller('tenant-details')
export class TenantDetailsController {
  constructor(private readonly service: TenantDetailsService) {}

  @Post()
  create(@Body() dto: CreateTenantDetailsDto) {
    return this.service.create(dto);
  }

  @Get(':tenantId')
  get(@Param('tenantId') tenantId: string) {
    return this.service.findByTenantId(tenantId);
  }

  @Patch(':tenantId')
  patch(@Param('tenantId') tenantId: string, @Body() dto: UpdateTenantDetailsDto) {
    return this.service.updateByTenantId(tenantId, dto);
  }

  // Optional: upsert endpoint (nice for “save profile” screens)
  @Put(':tenantId')
  upsert(@Param('tenantId') tenantId: string, @Body() dto: UpdateTenantDetailsDto) {
    return this.service.upsertByTenantId(tenantId, dto);
  }
}