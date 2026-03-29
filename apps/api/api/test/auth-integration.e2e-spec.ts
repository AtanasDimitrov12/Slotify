import request from 'supertest';
import { TestContext } from './integration-utils';

describe('Authentication (Integration)', () => {
  const ctx = new TestContext();

  beforeAll(async () => {
    await ctx.setup();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.cleanup();
  });

  const registerDto = {
    name: 'Owner User',
    email: 'owner@slotify.com',
    password: 'password123',
    tenantName: 'The Barber Shop',
  };

  describe('POST /auth/register', () => {
    it('should register a new user and tenant successfully', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.account).toMatchObject({
        name: registerDto.name,
        email: registerDto.email,
        role: 'owner',
        accountType: 'internal',
      });
      expect(response.body.account).toHaveProperty('tenantId');

      // Verify persistence in DB
      const user = await ctx.db
        .collection('users')
        .findOne({ email: registerDto.email.toLowerCase() });
      expect(user).toBeDefined();
      if (!user) throw new Error('User not found');
      expect(user.name).toBe(registerDto.name);
      expect(user.accountType).toBe('internal');

      const tenant = await ctx.db.collection('tenants').findOne({ name: registerDto.tenantName });
      expect(tenant).toBeDefined();
    });

    it('should fail if email is already in use', async () => {
      await request(ctx.app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);

      const response = await request(ctx.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toContain('Email already in use');
    });

    it('should fail with invalid input (ValidationPipe check)', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, email: 'not-an-email' })
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });
  });

  describe('POST /auth/register-customer', () => {
    const customerDto = {
      name: 'Customer User',
      email: 'customer@gmail.com',
      password: 'password123',
      phone: '+1234567890',
    };

    it('should register a new customer successfully', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/auth/register-customer')
        .send(customerDto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.account).toMatchObject({
        name: customerDto.name,
        email: customerDto.email,
        role: 'customer',
        accountType: 'customer',
      });
      expect(response.body.account).not.toHaveProperty('tenantId');

      // Verify persistence in DB
      const user = await ctx.db
        .collection('users')
        .findOne({ email: customerDto.email.toLowerCase() });
      expect(user).toBeDefined();
      if (!user) throw new Error('User not found');
      expect(user.accountType).toBe('customer');

      // Verify customer profile
      const profile = await ctx.db.collection('customerprofiles').findOne({ userId: user._id });
      expect(profile).toBeDefined();
      if (!profile) throw new Error('Profile not found');
      expect(profile.phone).toBe(customerDto.phone);
    });

    it('should fail if email is already in use', async () => {
      await request(ctx.app.getHttpServer())
        .post('/auth/register-customer')
        .send(customerDto)
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .post('/auth/register-customer')
        .send(customerDto)
        .expect(400);

      expect(response.body.message).toContain('Email already in use');
    });

    it('should fail with invalid phone', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/auth/register-customer')
        .send({ ...customerDto, phone: 'invalid' })
        .expect(400);

      expect(response.body.message[0]).toContain('Phone must be a valid E.164 phone number');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(ctx.app.getHttpServer()).post('/auth/register').send(registerDto).expect(201);
    });

    it('should login successfully and return access token', async () => {
      const response = await request(ctx.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.account.email).toBe(registerDto.email);
      expect(response.body.account.accountType).toBe('internal');
    });

    it('should login customer successfully', async () => {
      const customerDto = {
        name: 'Customer User',
        email: 'customer-login@gmail.com',
        password: 'password123',
        phone: '+1234567890',
      };
      await request(ctx.app.getHttpServer())
        .post('/auth/register-customer')
        .send(customerDto)
        .expect(201);

      const response = await request(ctx.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: customerDto.email,
          password: customerDto.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.account.email).toBe(customerDto.email);
      expect(response.body.account.accountType).toBe('customer');
      expect(response.body.account.role).toBe('customer');
    });

    it('should fail with incorrect password', async () => {
      await request(ctx.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail if user does not exist', async () => {
      await request(ctx.app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@slotify.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me (Guard check)', () => {
    it('should return 401 if no token provided', async () => {
      await request(ctx.app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return user info if valid token provided', async () => {
      const loginResponse = await request(ctx.app.getHttpServer())
        .post('/auth/register')
        .send(registerDto);

      const token = loginResponse.body.accessToken;

      const response = await request(ctx.app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: registerDto.email,
        role: 'owner',
        accountType: 'internal',
      });
    });

    it('should return customer info if valid token provided', async () => {
      const customerDto = {
        name: 'Customer Me',
        email: 'customer-me@gmail.com',
        password: 'password123',
        phone: '+1234567890',
      };
      const loginResponse = await request(ctx.app.getHttpServer())
        .post('/auth/register-customer')
        .send(customerDto);

      const token = loginResponse.body.accessToken;

      const response = await request(ctx.app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: customerDto.email,
        role: 'customer',
        accountType: 'customer',
      });
    });
  });
});
