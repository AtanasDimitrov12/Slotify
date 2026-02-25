import { IsEmail, IsString } from 'class-validator';

export class LoginTenantAccountDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}