import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

type AuthUser = {
  tenantId?: string;
  role?: string;
};

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  private getTenantIdOrThrow(currentUser: AuthUser): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    return tenantId;
  }

  private ensureOwnerOrManager(currentUser: AuthUser) {
    if (!['owner', 'manager'].includes(currentUser?.role ?? '')) {
      throw new UnauthorizedException(
        'You are not allowed to manage the services catalog',
      );
    }
  }

  @Post()
  create(@CurrentUser() currentUser: AuthUser, @Body() dto: CreateServiceDto) {
    this.ensureOwnerOrManager(currentUser);
    const tenantId = this.getTenantIdOrThrow(currentUser);

    return this.servicesService.createForTenant(tenantId, dto);
  }

  @Get('catalog')
  getCatalog(@CurrentUser() currentUser: AuthUser) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    return this.servicesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() currentUser: AuthUser, @Param('id') id: string) {
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }

    return this.servicesService.findOneForTenant(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    this.ensureOwnerOrManager(currentUser);
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }

    return this.servicesService.updateForTenant(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() currentUser: AuthUser, @Param('id') id: string) {
    this.ensureOwnerOrManager(currentUser);
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }

    return this.servicesService.removeForTenant(tenantId, id);
  }
}