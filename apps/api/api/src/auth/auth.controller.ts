import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import type { JwtPayload } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tenants')
  getMyTenants(@CurrentUser() user: JwtPayload) {
    return this.authService.getMyTenants(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch')
  switchTenant(@CurrentUser() user: JwtPayload, @Body('tenantId') tenantId: string) {
    return this.authService.switchTenant(user.sub, tenantId);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('test-route')
  testRoute() {
    return { ok: true };
  }

  @Post('register-customer')
  registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }
}
