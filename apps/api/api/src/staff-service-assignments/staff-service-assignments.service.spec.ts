import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StaffServiceAssignmentsService } from './staff-service-assignments.service';
import { StaffServiceAssignment } from './staff-service-assignment.schema';

describe('StaffServiceAssignmentsService', () => {
  let service: StaffServiceAssignmentsService;

  const mockAssignment = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    serviceId: new Types.ObjectId(),
    customDurationMinutes: 45,
    customPrice: 35,
    isOffered: true,
  };

  const mockAssignmentModel = {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffServiceAssignmentsService,
        {
          provide: getModelToken(StaffServiceAssignment.name),
          useValue: mockAssignmentModel,
        },
      ],
    }).compile();

    service = module.get<StaffServiceAssignmentsService>(StaffServiceAssignmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      mockAssignmentModel.create.mockResolvedValue(mockAssignment);

      const dto = {
        tenantId: mockAssignment.tenantId.toString(),
        userId: mockAssignment.userId.toString(),
        serviceId: mockAssignment.serviceId.toString(),
        customDurationMinutes: 45,
      };

      const result = await service.create(dto);

      expect(mockAssignmentModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAllByStaff', () => {
    it('should return all assignments for staff', async () => {
      mockAssignmentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockAssignment]),
        }),
      });

      const result = await service.findAllByStaff(
        mockAssignment.tenantId.toString(),
        mockAssignment.userId.toString()
      );

      expect(mockAssignmentModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update and return assignment', async () => {
      mockAssignmentModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockAssignment),
        }),
      });

      const result = await service.update(
        mockAssignment._id.toString(),
        { customPrice: 40 }
      );

      expect(mockAssignmentModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      mockAssignmentModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.update(new Types.ObjectId().toString(), { customPrice: 40 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
