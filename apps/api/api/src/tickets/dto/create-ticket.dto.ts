import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  userStories?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  acceptanceCriteria?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  nonTechnicalAcceptanceCriteria?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsEnum(['bugfix', 'feature', 'request', 'question'])
  @IsOptional()
  type?: string;

  @IsEnum(['user_requested', 'owner_requested', 'internal', 'in_progress', 'done'])
  @IsOptional()
  stage?: string;
}
