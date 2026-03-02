import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { MembershipsService } from '../memberships/memberships.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service'; // ✅ add this import
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type JwtPayload = {
  sub: string;
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
    private readonly tenantsService: TenantsService, // ✅ inject this
  ) { }

  async login(dto: LoginDto) {
    const { email, password, tenantId } = dto;

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // If tenantId is provided, log in to that tenant
    if (tenantId) {
      const membership = await this.membershipsService.findActiveByUserIdAndTenantId(
        user._id.toString(),
        tenantId,
      );

      if (!membership) {
        throw new UnauthorizedException('You are not a member of this tenant');
      }
      return this.finalizeLogin(user, membership);
    }

    // If no tenantId, check all memberships
    const memberships = await this.membershipsService.findAllByUserId(
      user._id.toString(),
    );

    if (memberships.length === 0) {
      throw new UnauthorizedException('No membership found for this user');
    }

    // If user has only one membership, log in to that one
    if (memberships.length === 1) {
      return this.finalizeLogin(user, memberships[0]);
    }

    // If user has multiple memberships, return a list for them to choose
    return {
      tenants: memberships.map((m) => m.tenantId),
    };
  }

  private async finalizeLogin(user, membership) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      tenantId: membership.tenantId.toString(),
      role: membership.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      account: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: membership.role,
        tenantId: membership.tenantId.toString(),
      },
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    // 1) Prevent duplicate user
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    // 2) Create tenant (or reuse if you prefer)
    // If you want tenant names unique:
    const existingTenant = await this.tenantsService.findByName(dto.tenantName.trim());
    if (existingTenant) throw new BadRequestException('Tenant name already exists');

    const tenant = await this.tenantsService.create({
      name: dto.tenantName.trim(),
    });

    // 3) Create user with hashed password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email,
      password: passwordHash,
    });

    // 4) Create membership as OWNER
    const membership = await this.membershipsService.create({
      tenantId: tenant._id.toString(),
      userId: user._id.toString(),
      role: 'owner',
    });

    // 5) Sign token
    const payload: JwtPayload = {
      sub: user._id.toString(),
      tenantId: membership.tenantId.toString(),
      role: membership.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      account: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: membership.role,
        tenantId: membership.tenantId.toString(),
      },
    };
  }
}