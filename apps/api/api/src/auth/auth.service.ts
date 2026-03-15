import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { MembershipsService } from '../memberships/memberships.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type JwtPayload = {
  sub: string;
  userId: string;
  tenantId: string;
  role: 'owner' | 'manager' | 'staff';
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
  ) {}

  private getId(value: any): string {
    if (!value) return '';

    if (typeof value === 'string') return value;

    if (value._id) return value._id.toString();

    if (value.id && typeof value.id === 'string') return value.id;

    return String(value);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const { password, tenantId } = dto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = this.getId(user._id);

    if (tenantId) {
      const membership = await this.membershipsService.findActiveByUserIdAndTenantId(
        userId,
        tenantId,
      );

      if (!membership) {
        throw new UnauthorizedException('You are not a member of this tenant');
      }

      return this.finalizeLogin(user, membership);
    }

    const memberships = await this.membershipsService.findAllByUserId(userId);

    if (memberships.length === 0) {
      throw new UnauthorizedException('No membership found for this user');
    }

    if (memberships.length === 1) {
      return this.finalizeLogin(user, memberships[0]);
    }

    return {
      tenants: memberships.map((m: any) => ({
        _id: this.getId(m.tenantId),
        name: m.tenantId?.name ?? undefined,
      })),
    };
  }

  private async finalizeLogin(user: any, membership: any) {
    const userId = this.getId(user._id);
    const tenantId = this.getId(membership.tenantId);

    if (!tenantId) {
      throw new UnauthorizedException('Invalid tenant membership');
    }

    const payload: JwtPayload = {
      sub: userId,
      userId: userId,
      tenantId,
      role: membership.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      account: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: membership.role,
        tenantId,
      },
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const tenantName = dto.tenantName.trim();
    const userName = dto.name.trim();

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const existingTenant = await this.tenantsService.findByName(tenantName);
    if (existingTenant) {
      throw new BadRequestException('Tenant name already exists');
    }

    const tenant = await this.tenantsService.create({
      name: tenantName,
    });

    const tenantId = this.getId(tenant._id);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: userName,
      email,
      password: passwordHash,
    });

    const userId = this.getId(user._id);

    const membership = await this.membershipsService.create({
      tenantId,
      userId,
      role: 'owner',
    });

    const payload: JwtPayload = {
      sub: userId,
      userId: userId,
      tenantId,
      role: membership.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      account: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: membership.role,
        tenantId,
      },
    };
  }
}