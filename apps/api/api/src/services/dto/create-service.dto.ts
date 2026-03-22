import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsInt()
  @Min(1)
  durationMin!: number;

  @IsNumber()
  @Min(0)
  priceEUR!: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}