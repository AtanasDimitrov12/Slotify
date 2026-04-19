import { expect, test } from '@playwright/test';
import { ADMIN_URL, loginThroughUi, registerOwner, USER_URL } from './helpers';

test.describe('Authentication', () => {
  const getTestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  test('should register a new customer successfully', async ({ page }) => {
    const testId = getTestId();
    const customerEmail = `auth_reg_${testId}@example.com`;
    const customerPassword = 'password123';

    await page.goto(`${USER_URL}/register`);

    await page.getByLabel(/Full Name/i).fill('Auth Customer');
    await page.getByLabel(/Email/i).fill(customerEmail);
    await page.getByLabel(/Phone Number/i).fill('+31612345678');
    await page.getByLabel(/Password/i).fill(customerPassword);

    await page.getByRole('button', { name: /Create account/i }).click();

    await expect(page.getByText(/Account created successfully/i)).toBeVisible({
      timeout: 10000,
    });

    await expect(page).toHaveURL(`${USER_URL}/`);
  });

  test('should fail to login with invalid password', async ({ page, request }) => {
    const { ownerEmail } = await registerOwner(request, {
      testId: `auth-fail-${getTestId()}`,
    });

    await page.goto(`${ADMIN_URL}/login`);

    await expect(page.getByText(/Partner login/i)).toBeVisible({
      timeout: 20000,
    });

    await page.locator('#email').fill(ownerEmail);
    await page.locator('#password').fill('wrongpassword');

    await page.getByRole('button', { name: /Sign in/i }).click();

    await expect(page.getByText(/Incorrect email or password/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should fail to login with non-existent user', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);

    await expect(page.getByText(/Partner login/i)).toBeVisible({
      timeout: 20000,
    });

    await page.locator('#email').fill(`nonexistent_${getTestId()}@example.com`);
    await page.locator('#password').fill('password123');

    await page.getByRole('button', { name: /Sign in/i }).click();

    await expect(
      page.getByText(/We could not find an account with that email|Incorrect email or password/i),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test('should login successfully as owner', async ({ page, request }) => {
    const { ownerEmail, password: ownerPassword } = await registerOwner(request, {
      testId: `auth-success-${getTestId()}`,
    });

    await loginThroughUi(page, ownerEmail, ownerPassword, {
      expectedPath: /\/owner/,
    });

    await expect(page).toHaveURL(/\/owner/);

    await expect(page.getByRole('button', { name: /^Overview$/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should handle logout correctly', async ({ page, request }) => {
    const { ownerEmail, password: ownerPassword } = await registerOwner(request, {
      testId: `auth-logout-${getTestId()}`,
    });

    await loginThroughUi(page, ownerEmail, ownerPassword, {
      expectedPath: /\/owner/,
    });

    await expect(page).toHaveURL(/\/owner/);
    await expect(page.getByRole('button', { name: /^Overview$/i })).toBeVisible();

    const logoutButton = page.getByRole('button', { name: /^Logout$/i });

    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toBeEnabled();

    await logoutButton.click();

    await expect(page.getByText(/Partner login/i)).toBeVisible({
      timeout: 15000,
    });

    await expect(page).toHaveURL(/\/login|\/$/);
  });
});
