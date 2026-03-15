import { IsIn } from 'class-validator';

export class UpdateStaffAppointmentStatusDto {
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed', 'no-show'])
  status!: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
}