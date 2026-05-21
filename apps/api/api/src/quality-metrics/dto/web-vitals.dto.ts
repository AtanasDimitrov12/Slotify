import { IsNumber, IsOptional } from 'class-validator';

export class WebVitalsDto {
  @IsNumber()
  fcp!: number;

  @IsNumber()
  lcp!: number;

  @IsNumber()
  cls!: number;

  @IsNumber()
  @IsOptional()
  fid?: number;

  @IsNumber()
  @IsOptional()
  inp?: number;

  @IsNumber()
  @IsOptional()
  ttfb?: number;
}
