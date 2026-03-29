import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateCustomerProfileDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
