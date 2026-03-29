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
      });
      expect(response.body.account).toHaveProperty('tenantId');

      // Verify persistence in DB
      const user = await ctx.db
        .collection('users')
        .findOne({ email: registerDto.email.toLowerCase() });
      expect(user).toBeDefined();
      if (!user) throw new Error('User not found');
      expect(user.name).toBe(registerDto.name);

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
      });
    });
  });
});
