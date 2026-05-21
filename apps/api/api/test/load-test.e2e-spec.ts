import { TestContext } from './integration-utils';
import request from 'supertest';
import { SystemHealthService } from '../src/quality-metrics/system-health.service';

describe('Load Test', () => {
  const ctx = new TestContext();

  beforeAll(async () => {
    await ctx.setup();
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('should handle heavy load', async () => {
    const CONCURRENCY = 3;
    const TOTAL_REQUESTS = 150;
    
    console.log(`Starting load test with ${TOTAL_REQUESTS} requests (${CONCURRENCY} concurrent)...`);

    // Setup initial data
    const ownerRegisterDto = {
      name: 'Load Test Owner',
      email: 'loadtest@test.com',
      password: 'password123',
      tenantName: 'Elite Load Salon',
    };

    const registerResponse = await request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send(ownerRegisterDto);
    
    const ownerToken = registerResponse.body.accessToken;
    const slug = 'elite-load-salon';

    // Create a service to use in availability checks
    const serviceResponse = await request(ctx.app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Load Test Service',
        durationMin: 30,
        priceEUR: 20,
      });
    
    const serviceId = serviceResponse.body._id;

    // 1. Warm up health collection
    await ctx.app.get(SystemHealthService).collectMetrics();

    // 2. Report some fake web vitals
    await request(ctx.app.getHttpServer())
      .post('/quality-metrics/web-vitals')
      .send({
        fcp: 1200,
        lcp: 2100,
        cls: 0.05,
        inp: 45,
        ttfb: 150,
      })
      .expect(201);

    const startTime = Date.now();
    let completed = 0;
    let failed = 0;
    let requested = 0;
    let lastError: any = null;

    async function worker() {
      while (true) {
        const i = requested++;
        if (i >= TOTAL_REQUESTS) break;

        try {
          const res = i % 2 === 0 
            ? await request(ctx.app.getHttpServer()).get(`/public/tenants/${slug}`)
            : await request(ctx.app.getHttpServer()).get(`/public/tenants/${slug}/availability`).query({ serviceId, date: '2026-06-01' });
          
          if (res.status === 200) {
            completed++;
          } else {
            failed++;
            lastError = { status: res.status, body: res.body };
          }
        } catch (err) {
          failed++;
          lastError = err;
        }

        if ((completed + failed) % 50 === 0) {
          console.log(`Progress: ${completed + failed}/${TOTAL_REQUESTS}`);
        }

        // Small pause to be kind to the socket pool
        await new Promise(r => setTimeout(r, 1));
      }
    }

    const workers = Array(CONCURRENCY).fill(0).map(() => worker());
    await Promise.all(workers);

    // Give some time for fire-and-forget interceptors to save metrics
    await new Promise(resolve => setTimeout(resolve, 500));

    const durationSec = (Date.now() - startTime) / 1000;
    const rps = TOTAL_REQUESTS / durationSec;

    console.log('\nLoad Test Results:');
    console.log(`Total Requests: ${TOTAL_REQUESTS}`);
    console.log(`Successful: ${completed}`);
    console.log(`Failed: ${failed}`);
    if (lastError) {
      console.log('Last Error Example:', JSON.stringify(lastError));
    }
    console.log(`Duration: ${durationSec.toFixed(2)}s`);
    console.log(`Requests Per Second: ${rps.toFixed(2)}`);

    expect(failed).toBe(0);
  }, 60000);
});
