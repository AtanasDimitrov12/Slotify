import { Test, type TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/jwt.strategy';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

describe('StaffController', () => {
  let controller: StaffController;
  let staffService: StaffService;

  const mockUser: JwtPayload = {
    sub: 'u1',
    _id: 'u1',
    name: 'Staff',
    tenantId: 't1',
    role: 'staff',
    email: 's@s.com',
    accountType: 'internal',
  };

  const mockStaffService = {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
    getMyAvailability: jest.fn(),
    updateMyAvailability: jest.fn(),
    getMyTimeOff: jest.fn(),
    createMyTimeOff: jest.fn(),
    removeMyTimeOff: jest.fn(),
    listStaff: jest.fn(),
    getMyServices: jest.fn(),
    createMyService: jest.fn(),
    updateMyService: jest.fn(),
    removeMyService: jest.fn(),
    listAvailableStaffForOwner: jest.fn(),
    onboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
      ],
    }).compile();

    controller = module.get<StaffController>(StaffController);
    staffService = module.get<StaffService>(StaffService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should call staffService.getMyProfile', async () => {
      await controller.getMyProfile(mockUser);
      expect(staffService.getMyProfile).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateMyProfile', () => {
    it('should call staffService.updateMyProfile', async () => {
      const dto = { displayName: 'New' };
      await controller.updateMyProfile(mockUser, dto as any);
      expect(staffService.updateMyProfile).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('getMyAvailability', () => {
    it('should call staffService.getMyAvailability', async () => {
      await controller.getMyAvailability(mockUser);
      expect(staffService.getMyAvailability).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateMyAvailability', () => {
    it('should call staffService.updateMyAvailability', async () => {
      const dto = { weeklyAvailability: [] };
      await controller.updateMyAvailability(mockUser, dto as any);
      expect(staffService.updateMyAvailability).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('getMyTimeOff', () => {
    it('should call staffService.getMyTimeOff', async () => {
      await controller.getMyTimeOff(mockUser);
      expect(staffService.getMyTimeOff).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('createMyTimeOff', () => {
    it('should call staffService.createMyTimeOff', async () => {
      const dto = { startDate: '2026-01-01', endDate: '2026-01-02' };
      await controller.createMyTimeOff(mockUser, dto);
      expect(staffService.createMyTimeOff).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('removeMyTimeOff', () => {
    it('should call staffService.removeMyTimeOff', async () => {
      await controller.removeMyTimeOff(mockUser, 'id1');
      expect(staffService.removeMyTimeOff).toHaveBeenCalledWith(mockUser, 'id1');
    });
  });

  describe('list', () => {
    it('should call staffService.listStaff', async () => {
      await controller.list(mockUser);
      expect(staffService.listStaff).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getMyServices', () => {
    it('should call staffService.getMyServices', async () => {
      await controller.getMyServices(mockUser);
      expect(staffService.getMyServices).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('createMyService', () => {
    it('should call staffService.createMyService', async () => {
      const dto = { serviceId: 's1' };
      await controller.createMyService(mockUser, dto);
      expect(staffService.createMyService).toHaveBeenCalledWith(mockUser, dto);
    });
  });

  describe('updateMyService', () => {
    it('should call staffService.updateMyService', async () => {
      const dto = { durationMin: 40 };
      await controller.updateMyService(mockUser, 'id1', dto);
      expect(staffService.updateMyService).toHaveBeenCalledWith(mockUser, 'id1', dto);
    });
  });

  describe('removeMyService', () => {
    it('should call staffService.removeMyService', async () => {
      await controller.removeMyService(mockUser, 'id1');
      expect(staffService.removeMyService).toHaveBeenCalledWith(mockUser, 'id1');
    });
  });

  describe('listAvailable', () => {
    it('should call staffService.listAvailableStaffForOwner', async () => {
      await controller.listAvailable(mockUser);
      expect(staffService.listAvailableStaffForOwner).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('onboard', () => {
    it('should call staffService.onboard', async () => {
      const dto = { name: 'New', email: 'n@n.com' };
      await controller.onboard(mockUser, dto);
      expect(staffService.onboard).toHaveBeenCalledWith(mockUser, dto);
    });
  });
});
