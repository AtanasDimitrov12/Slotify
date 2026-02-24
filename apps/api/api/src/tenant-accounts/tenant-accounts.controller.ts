import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TenantAccountsService } from './tenant-accounts.service';
import { CreateTenantAccountDto } from './dto/create-tenant-account.dto';
import { UpdateTenantAccountDto } from './dto/update-tenant-account.dto';

@Controller('tenant-accounts')
export class TenantAccountsController {
  constructor(private readonly tenantAccountsService: TenantAccountsService) {}

  @Post()
  create(@Body() dto: CreateTenantAccountDto) {
    return this.tenantAccountsService.create(dto);
  }

  // Useful for admin/debugging (remove later or protect with auth)
  @Get('tenant/:tenantId')
  listByTenant(@Param('tenantId') tenantId: string) {
    return this.tenantAccountsService.listByTenant(tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantAccountDto) {
    return this.tenantAccountsService.update(id, dto);
  }
}