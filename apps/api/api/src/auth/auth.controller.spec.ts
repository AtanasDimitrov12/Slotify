import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    registerCustomer: jest.fn(),
    getMyTenants: jest.fn(),
    switchTenant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@test.com', password: 'password' };
      await controller.login(dto as any);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('me', () => {
    it('should return the current user', () => {
      const user = { sub: 'u1', email: 'j@j.com' };
      expect(controller.me(user as any)).toEqual(user);
    });
  });

  describe('getMyTenants', () => {
    it('should call authService.getMyTenants', async () => {
      const user = { sub: 'u1' };
      await controller.getMyTenants(user as any);
      expect(authService.getMyTenants).toHaveBeenCalledWith('u1');
    });
  });

  describe('switchTenant', () => {
    it('should call authService.switchTenant', async () => {
      const user = { sub: 'u1' };
      await controller.switchTenant(user as any, 't2');
      expect(authService.switchTenant).toHaveBeenCalledWith('u1', 't2');
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = { name: 'Jane', email: 'j@j.com', password: '123', tenantName: 'T1' };
      await controller.register(dto as any);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('registerCustomer', () => {
    it('should call authService.registerCustomer', async () => {
      const dto = { name: 'Joe', email: 'j@j.com', password: '123', phone: '123' };
      await controller.registerCustomer(dto as any);
      expect(authService.registerCustomer).toHaveBeenCalledWith(dto);
    });
  });
});
