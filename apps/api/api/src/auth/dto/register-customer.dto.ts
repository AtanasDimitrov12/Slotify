import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid E.164 phone number',
  })
  phone!: string;
}
