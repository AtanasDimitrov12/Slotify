import { Test, type TestingModule } from '@nestjs/testing';
import { StaffServiceAssignmentsController } from './staff-service-assignments.controller';
import { StaffServiceAssignmentsService } from './staff-service-assignments.service';

describe('StaffServiceAssignmentsController', () => {
  let controller: StaffServiceAssignmentsController;
  let service: StaffServiceAssignmentsService;

  const mockService = {
    create: jest.fn(),
    findAllByStaff: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffServiceAssignmentsController],
      providers: [{ provide: StaffServiceAssignmentsService, useValue: mockService }],
    }).compile();

    controller = module.get<StaffServiceAssignmentsController>(StaffServiceAssignmentsController);
    service = module.get<StaffServiceAssignmentsService>(StaffServiceAssignmentsService);
  });

  it('create should call service.create', async () => {
    const dto = { userId: 'u1', serviceId: 's1', tenantId: 't1' };
    await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAllByStaff should call service.findAllByStaff', async () => {
    await controller.findAllByStaff('t1', 'u1');
    expect(service.findAllByStaff).toHaveBeenCalledWith('t1', 'u1');
  });

  it('update should call service.update', async () => {
    const dto = { customPrice: 50 };
    await controller.update('id1', dto as any);
    expect(service.update).toHaveBeenCalledWith('id1', dto);
  });

  it('remove should call service.remove', async () => {
    await controller.remove('id1');
    expect(service.remove).toHaveBeenCalledWith('id1');
  });
});
