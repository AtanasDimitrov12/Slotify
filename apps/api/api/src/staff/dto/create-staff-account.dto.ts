import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStaffAccountDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}