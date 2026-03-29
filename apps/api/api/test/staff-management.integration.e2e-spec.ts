import request from 'supertest';
import { TestContext } from './integration-utils';

describe('Staff Management (Integration)', () => {
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

  const ownerRegisterDto = {
    name: 'Owner User',
    email: 'owner@slotify.com',
    password: 'password123',
    tenantName: 'The Barber Shop',
  };

  const staffCreateDto = {
    name: 'Barber Joe',
    email: 'joe@slotify.com',
    password: 'joepassword123',
  };

  async function getOwnerAuth() {
    const response = await request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send(ownerRegisterDto);
    return {
      token: response.body.accessToken,
      tenantId: response.body.account.tenantId,
    };
  }

  describe('POST /staff/onboard', () => {
    it('should allow owner to onboard a new staff member', async () => {
      const { token } = await getOwnerAuth();

      const response = await request(ctx.app.getHttpServer())
        .post('/staff/onboard')
        .set('Authorization', `Bearer ${token}`)
        .send(staffCreateDto)
        .expect(201);

      expect(response.body.message).toBe('Staff member created successfully');
      expect(response.body.account).toMatchObject({
        name: staffCreateDto.name,
        email: staffCreateDto.email,
        role: 'staff',
      });

      // Verify DB state
      const user = await ctx.db.collection('users').findOne({ email: staffCreateDto.email });
      expect(user).toBeDefined();
      if (!user) throw new Error('User not found');

      const profile = await ctx.db.collection('staffprofiles').findOne({ userId: user._id });
      expect(profile).toBeDefined();
      if (!profile) throw new Error('Profile not found');
      expect(profile.displayName).toBe(staffCreateDto.name);

      const availability = await ctx.db
        .collection('staffavailabilities')
        .findOne({ userId: user._id });
      expect(availability).toBeDefined();
      if (!availability) throw new Error('Availability not found');
      expect(availability.weeklyAvailability).toHaveLength(5); // Default Mon-Fri
    });

    it('should prevent non-owners from onboarding staff', async () => {
      // 1. Create owner and onboard Joe (staff)
      const { token: ownerToken } = await getOwnerAuth();
      await request(ctx.app.getHttpServer())
        .post('/staff/onboard')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(staffCreateDto);

      // 2. Login as Joe (staff)
      const loginResponse = await request(ctx.app.getHttpServer()).post('/auth/login').send({
        email: staffCreateDto.email,
        password: staffCreateDto.password,
      });
      const joeToken = loginResponse.body.accessToken;

      // 3. Joe tries to onboard another staff member
      await request(ctx.app.getHttpServer())
        .post('/staff/onboard')
        .set('Authorization', `Bearer ${joeToken}`)
        .send({ name: 'Other', email: 'other@s.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('Staff Profile & Availability', () => {
    let joeToken: string;

    beforeEach(async () => {
      const { token: ownerToken } = await getOwnerAuth();
      await request(ctx.app.getHttpServer())
        .post('/staff/onboard')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(staffCreateDto);

      const loginResponse = await request(ctx.app.getHttpServer()).post('/auth/login').send({
        email: staffCreateDto.email,
        password: staffCreateDto.password,
      });
      joeToken = loginResponse.body.accessToken;
    });

    it('should allow staff to get and update their profile', async () => {
      const profileResponse = await request(ctx.app.getHttpServer())
        .get('/staff/me/profile')
        .set('Authorization', `Bearer ${joeToken}`)
        .expect(200);

      expect(profileResponse.body.name).toBe(staffCreateDto.name);

      const updateDto = {
        bio: 'Expert in fade haircuts',
        experienceYears: 5,
        expertise: ['fade', 'beard'],
      };

      const updateResponse = await request(ctx.app.getHttpServer())
        .put('/staff/me/profile')
        .set('Authorization', `Bearer ${joeToken}`)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.bio).toBe(updateDto.bio);
      expect(updateResponse.body.experienceYears).toBe(updateDto.experienceYears);
      expect(updateResponse.body.expertiseTags).toContain('fade');
    });

    it('should allow staff to update their availability', async () => {
      const currentAvail = await request(ctx.app.getHttpServer())
        .get('/staff/me/availability')
        .set('Authorization', `Bearer ${joeToken}`)
        .expect(200);

      const newAvailability = {
        weeklyAvailability: [
          {
            dayOfWeek: 1,
            startTime: '10:00',
            endTime: '18:00',
            isAvailable: true,
          },
        ],
      };

      await request(ctx.app.getHttpServer())
        .put('/staff/me/availability')
        .set('Authorization', `Bearer ${joeToken}`)
        .send(newAvailability)
        .expect(200);

      const updatedAvail = await request(ctx.app.getHttpServer())
        .get('/staff/me/availability')
        .set('Authorization', `Bearer ${joeToken}`)
        .expect(200);

      expect(updatedAvail.body.weeklyAvailability[0].startTime).toBe('10:00');
    });
  });
});
