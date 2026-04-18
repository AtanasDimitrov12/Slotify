import { Test, type TestingModule } from '@nestjs/testing';
import { CreateStaffAvailabilityDto } from './dto/create-staff-availability.dto';
import { UpdateStaffAvailabilityDto } from './dto/update-staff-availability.dto';
import { StaffAvailabilityController } from './staff-availability.controller';
import { StaffAvailabilityService } from './staff-availability.service';

describe('StaffAvailabilityController', () => {
  let controller: StaffAvailabilityController;
  let service: StaffAvailabilityService;

  const mockStaffAvailabilityService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffAvailabilityController],
      providers: [
        {
          provide: StaffAvailabilityService,
          useValue: mockStaffAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<StaffAvailabilityController>(StaffAvailabilityController);
    service = module.get<StaffAvailabilityService>(StaffAvailabilityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateStaffAvailabilityDto = {
        tenantId: 't1',
        userId: 'u1',
        weeklyAvailability: [],
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto: UpdateStaffAvailabilityDto = { weeklyAvailability: [] };
      await controller.update('id1', dto);
      expect(service.update).toHaveBeenCalledWith('id1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove('id1');
      expect(service.remove).toHaveBeenCalledWith('id1');
    });
  });
});
