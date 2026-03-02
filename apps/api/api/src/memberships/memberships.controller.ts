import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('memberships')
@UseGuards(JwtAuthGuard)
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    create(@Body() dto: CreateMembershipDto) {
        return this.membershipsService.create(dto);
    }

    @Get('tenant/:tenantId')
    listByTenant(@Param('tenantId') tenantId: string) {
        return this.membershipsService.listByTenant(tenantId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMembershipDto) {
        return this.membershipsService.update(id, dto);
    }
}
