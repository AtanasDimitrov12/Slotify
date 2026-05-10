import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsArray()
  @IsEnum(['info_needed', 'blocked', 'requested_changes', 'hold', 'has_pr', 'awaiting_feedback'], {
    each: true,
  })
  @IsOptional()
  badges?: string[];

  @IsEnum(['user_requested', 'owner_requested', 'internal', 'in_progress', 'done'])
  @IsOptional()
  stage?: string;
}
