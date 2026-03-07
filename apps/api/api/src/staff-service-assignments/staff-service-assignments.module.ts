import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StaffServiceAssignment,
  StaffServiceAssignmentSchema,
} from './staff-service-assignment.schema';
import { StaffServiceAssignmentsService } from './staff-service-assignments.service';
import { StaffServiceAssignmentsController } from './staff-service-assignments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StaffServiceAssignment.name,
        schema: StaffServiceAssignmentSchema,
      },
    ]),
  ],
  controllers: [StaffServiceAssignmentsController],
  providers: [StaffServiceAssignmentsService],
  exports: [StaffServiceAssignmentsService],
})
export class StaffServiceAssignmentsModule {}