import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateTenantAccountDto {
  @IsString()
  tenantId!: string;

  @IsString()
  @Length(2, 80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 100)
  password!: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}