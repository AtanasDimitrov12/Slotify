import { IsDateString } from 'class-validator';

export class ListStaffAppointmentsDto {
  @IsDateString()
  date!: string;
}