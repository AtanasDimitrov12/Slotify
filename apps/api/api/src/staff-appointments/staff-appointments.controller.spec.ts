import { Test, type TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/jwt.strategy';
import { MembershipsService } from '../memberships/memberships.service';
import { StaffAppointmentsController } from './staff-appointments.controller';
import { StaffAppointmentsService } from './staff-appointments.service';

describe('StaffAppointmentsController', () => {
  let controller: StaffAppointmentsController;
  let service: StaffAppointmentsService;
  let membershipsService: MembershipsService;

  const mockUser: JwtPayload = {
    sub: 'u1',
    _id: 'u1',
    name: 'Staff Member',
    tenantId: 't1',
    role: 'staff',
    email: 's@s.com',
    accountType: 'internal',
  };

  const mockService = {
    listBookableServicesForStaff: jest.fn(),
    list: jest.fn(),
    getCustomerInsights: jest.fn(),
    createForStaff: jest.fn(),
    updateForStaff: jest.fn(),
    updateStatusForStaff: jest.fn(),
    cancelForStaff: jest.fn(),
  };

  const mockMembershipsService = {
    findAllByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffAppointmentsController],
      providers: [
        { provide: StaffAppointmentsService, useValue: mockService },
        { provide: MembershipsService, useValue: mockMembershipsService },
      ],
    }).compile();

    controller = module.get<StaffAppointmentsController>(StaffAppointmentsController);
    service = module.get<StaffAppointmentsService>(StaffAppointmentsService);
    membershipsService = module.get<MembershipsService>(MembershipsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listServices', () => {
    it('should call service.listBookableServicesForStaff with tenant ids', async () => {
      mockMembershipsService.findAllByUserId.mockResolvedValue([
        { tenantId: 't1', role: 'staff' },
        { tenantId: 't2', role: 'staff' },
      ]);
      await controller.listServices(mockUser);
      expect(service.listBookableServicesForStaff).toHaveBeenCalledWith({
        tenantIds: ['t1', 't2'],
        userId: 'u1',
      });
    });
  });

  describe('list', () => {
    it('should call service.list with query and tenant ids', async () => {
      mockMembershipsService.findAllByUserId.mockResolvedValue([{ tenantId: 't1', role: 'staff' }]);
      const query = { date: '2026-01-01' };
      await controller.list(mockUser, query);
      expect(service.list).toHaveBeenCalledWith({
        tenantIds: ['t1'],
        userId: 'u1',
        ...query,
      });
    });
  });

  describe('create', () => {
    it('should call service.createForStaff', async () => {
      const dto = {
        staffServiceAssignmentId: 'a1',
        startTime: '...',
        customerName: 'C',
        customerPhone: '1',
      };
      await controller.create(mockUser, dto as any);
      expect(service.createForStaff).toHaveBeenCalledWith({
        tenantId: 't1',
        userId: 'u1',
        dto,
      });
    });
  });
});
