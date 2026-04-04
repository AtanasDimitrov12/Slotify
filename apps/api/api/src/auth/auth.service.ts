import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

import { CustomerProfilesService } from '../customer-profiles/customer-profiles.service';
import { MembershipDocument } from '../memberships/membership.schema';
import { MembershipsService } from '../memberships/memberships.service';
import { TenantsService } from '../tenants/tenants.service';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';

type JwtPayload = {
  sub: string;
  _id: string;
  userId: string;
  name: string;
  tenantId?: string;
  role?: 'owner' | 'manager' | 'staff' | 'customer';
  email: string;
  accountType: 'internal' | 'customer';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly customerProfilesService: CustomerProfilesService,
  ) {}

  private getId(
    value: string | Types.ObjectId | { _id: Types.ObjectId } | { id: string } | null | undefined,
  ): string {
    if (!value) return '';

    if (typeof value === 'string') return value;

    if (value instanceof Types.ObjectId) return value.toString();

    if (value && typeof value === 'object' && '_id' in value && value._id)
      return value._id.toString();

    if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
      return value.id;

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

    if (user.accountType === 'customer') {
      return this.finalizeCustomerLogin(user);
    }

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
      tenants: memberships.map((m: MembershipDocument & { tenantId: { name?: string } }) => ({
        _id: this.getId(m.tenantId),
        name: m.tenantId?.name ?? undefined,
      })),
    };
  }

  private async finalizeLogin(user: UserDocument, membership: MembershipDocument) {
    const userId = this.getId(user._id);
    const tenantId = this.getId(membership.tenantId);

    if (!tenantId) {
      throw new UnauthorizedException('Invalid tenant membership');
    }

    const payload: JwtPayload = {
      sub: userId,
      _id: userId,
      userId: userId,
      name: user.name,
      tenantId,
      role: membership.role,
      email: user.email,
      accountType: 'internal',
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
        accountType: 'internal',
      },
    };
  }

  private async finalizeCustomerLogin(user: UserDocument) {
    const userId = this.getId(user._id);

    const payload: JwtPayload = {
      sub: userId,
      _id: userId,
      userId: userId,
      name: user.name,
      email: user.email,
      role: 'customer',
      accountType: 'customer',
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      account: {
        _id: userId,
        name: user.name,
        email: user.email,
        role: 'customer',
        accountType: 'customer',
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
      accountType: 'internal',
    });

    const userId = this.getId(user._id);

    const membership = await this.membershipsService.create({
      tenantId,
      userId,
      role: 'owner',
    });

    const payload: JwtPayload = {
      sub: userId,
      _id: userId,
      userId: userId,
      name: user.name,
      tenantId,
      role: membership.role,
      email: user.email,
      accountType: 'internal',
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
        accountType: 'internal',
      },
    };
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const email = dto.email.trim().toLowerCase();
    const userName = dto.name.trim();

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: userName,
      email,
      password: passwordHash,
      accountType: 'customer',
    });

    const userId = this.getId(user._id);

    await this.customerProfilesService.create({
      userId,
      phone: dto.phone,
    });

    return this.finalizeCustomerLogin(user);
  }
}
