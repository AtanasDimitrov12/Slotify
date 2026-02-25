import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TenantAccountsService } from '../tenant-accounts/tenant-accounts.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tenantAccountsService: TenantAccountsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const account = await this.tenantAccountsService.validateCredentials(email, password);
    if (!account) throw new UnauthorizedException('Invalid credentials');

    // Token payload: keep it minimal + useful
    const payload = {
      sub: account._id,
      tenantId: account.tenantId,
      role: account.role,
      email: account.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      account, // already sanitized (no password)
    };
  }
}