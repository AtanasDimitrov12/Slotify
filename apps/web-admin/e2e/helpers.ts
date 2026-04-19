import { type APIRequestContext, expect, type Page } from '@playwright/test';

export const ADMIN_URL = 'http://localhost:5173';
export const USER_URL = 'http://localhost:5174';
export const API_URL = 'http://localhost:4000';

export function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function expectOk(response: Awaited<ReturnType<APIRequestContext['get']>>) {
  const body = await response.text();
  expect(response.ok(), body).toBeTruthy();
  const data = body ? JSON.parse(body) : null;

  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item && item._id && !item.id) {
          item.id = item._id;
        }
      }
    } else if (data._id && !data.id) {
      data.id = data._id;
    }
  }

  return data;
}

export async function registerOwner(request: APIRequestContext, overrides?: { testId?: string }) {
  const testId = overrides?.testId ?? randomId();
  const ownerEmail = `owner_${testId}@example.com`;
  const password = 'password123';
  const salonName = `Salon ${testId}`;

  const response = await request.post(`${API_URL}/auth/register`, {
    data: {
      name: `Owner ${testId}`,
      email: ownerEmail,
      password,
      tenantName: salonName,
    },
  });

  const data = await expectOk(response);

  return {
    testId,
    ownerEmail,
    password,
    salonName,
    salonSlug: slugify(salonName),
    accessToken: data.accessToken as string,
    tenantId: data.account.tenantId as string,
    account: data.account,
  };
}

export async function createCatalogService(
  request: APIRequestContext,
  accessToken: string,
  payload: {
    name: string;
    durationMin: number;
    priceEUR: number;
    description?: string;
  },
) {
  const response = await request.post(`${API_URL}/services`, {
    data: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return expectOk(response);
}

export async function onboardStaff(
  request: APIRequestContext,
  accessToken: string,
  payload: {
    name: string;
    email: string;
    password: string;
  },
) {
  const response = await request.post(`${API_URL}/staff/onboard`, {
    data: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return expectOk(response);
}

export async function loginApi(
  request: APIRequestContext,
  email: string,
  password: string,
  tenantId?: string,
) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email, password, tenantId },
  });

  return expectOk(response);
}

export async function setOwnerOpeningHours(request: APIRequestContext, accessToken: string) {
  const response = await request.put(`${API_URL}/owner/settings/opening-hours`, {
    data: {
      days: [
        { key: 'mon', enabled: true, start: '00:00', end: '23:59' },
        { key: 'tue', enabled: true, start: '00:00', end: '23:59' },
        { key: 'wed', enabled: true, start: '00:00', end: '23:59' },
        { key: 'thu', enabled: true, start: '00:00', end: '23:59' },
        { key: 'fri', enabled: true, start: '00:00', end: '23:59' },
        { key: 'sat', enabled: true, start: '00:00', end: '23:59' },
        { key: 'sun', enabled: true, start: '00:00', end: '23:59' },
      ],
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return expectOk(response);
}

export async function setStaffAvailability(
  request: APIRequestContext,
  accessToken: string,
  tenantId: string,
) {
  const response = await request.put(`${API_URL}/staff/me/availability`, {
    data: {
      weeklyAvailability: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        dayOfWeek: day,
        isAvailable: true,
        slots: [{ startTime: '00:00', endTime: '23:59', tenantId }],
      })),
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return expectOk(response);
}

export async function assignServiceToStaff(
  request: APIRequestContext,
  accessToken: string,
  serviceId: string,
  overrides?: { durationMin?: number; priceEUR?: number },
) {
  const response = await request.post(`${API_URL}/staff/me/services`, {
    data: {
      serviceId,
      durationMin: overrides?.durationMin,
      priceEUR: overrides?.priceEUR,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return expectOk(response);
}

export async function loginThroughUi(
  page: Page,
  email: string,
  password: string,
  options?: {
    expectedPath?: RegExp;
  },
) {
  await page.goto(`${ADMIN_URL}/login`);

  await expect(page.getByText(/Partner login/i)).toBeVisible({
    timeout: 20000,
  });

  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  await page.getByRole('button', { name: /Sign in/i }).click();

  await page.waitForURL(options?.expectedPath ?? /\/owner|\/staff|\/admin/, {
    timeout: 20000,
  });
}

export async function loginCustomerThroughUi(page: Page, email: string, password: string) {
  await page.goto(`${USER_URL}/login`);
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/Password/i).fill(password);

  const signInButton = page.getByRole('button', { name: /^Sign in$/i });
  await expect(signInButton).toBeEnabled();
  await signInButton.click();

  await expect(page).toHaveURL(`${USER_URL}/`);
}
