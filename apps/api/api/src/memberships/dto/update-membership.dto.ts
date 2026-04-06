import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdateMembershipDto {
  @IsOptional()
  @IsIn(['owner', 'staff'])
  role?: 'owner' | 'staff';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
