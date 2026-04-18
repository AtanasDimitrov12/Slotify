import { Test, type TestingModule } from '@nestjs/testing';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';

describe('MembershipsController', () => {
  let controller: MembershipsController;
  let service: MembershipsService;

  const mockMembershipsService = {
    create: jest.fn(),
    listByTenant: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipsController],
      providers: [
        {
          provide: MembershipsService,
          useValue: mockMembershipsService,
        },
      ],
    }).compile();

    controller = module.get<MembershipsController>(MembershipsController);
    service = module.get<MembershipsService>(MembershipsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateMembershipDto = { tenantId: 't1', userId: 'u1', role: 'staff' };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('listByTenant', () => {
    it('should call service.listByTenant', async () => {
      await controller.listByTenant('t1');
      expect(service.listByTenant).toHaveBeenCalledWith('t1');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto: UpdateMembershipDto = { role: 'owner' };
      await controller.update('m1', dto);
      expect(service.update).toHaveBeenCalledWith('m1', dto);
    });
  });
});
