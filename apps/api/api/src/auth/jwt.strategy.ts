import { Injectable, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: ConfigService is injected by Nest at runtime and must stay a value import
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: string; // userId
  _id: string; // same as sub, for consistency
  name: string;
  tenantId?: string; // tenant scope, optional for customer
  role: 'owner' | 'manager' | 'staff' | 'customer';
  email: string;
  accountType: 'internal' | 'customer';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    if (payload.accountType === 'internal' && !payload.tenantId) {
      throw new UnauthorizedException('Internal accounts must have a tenantId');
    }

    return payload;
  }
}
