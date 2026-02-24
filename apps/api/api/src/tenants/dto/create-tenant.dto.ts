import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @Length(2, 80)
  name!: string;

  @IsOptional()
  @IsEmail()
  ownerEmail?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  plan?: string;
}