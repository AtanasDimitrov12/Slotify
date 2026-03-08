import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  durationMin!: number;

  @IsNumber()
  @Min(0)
  priceEUR!: number;

  @IsOptional()
  @IsString()
  description?: string;
}