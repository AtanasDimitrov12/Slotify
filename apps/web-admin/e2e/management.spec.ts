import { expect, test } from '@playwright/test';
import { loginThroughUi, registerOwner } from './helpers';

test.describe('Owner Management', () => {
  const getTestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  test('should manage services correctly', async ({ page, request }) => {
    const { ownerEmail, password } = await registerOwner(request, {
      testId: `manage-svc-${getTestId()}`,
    });

    await loginThroughUi(page, ownerEmail, password);

    await page.goto('/owner/services');
    await page.getByRole('button', { name: /Add Service/i }).click();

    await page.getByLabel(/Service Name/i).fill('Test Service');
    await page.getByLabel(/Duration \(min\)/i).fill('45');
    await page.getByRole('spinbutton', { name: /^Price/i }).fill('35');

    await page.getByRole('button', { name: /Create Service/i }).click();

    await expect(page.getByText(/Test Service/i)).toBeVisible();

    await page.getByRole('button', { name: /Edit/i }).first().click();

    await page.getByRole('spinbutton', { name: /^Price/i }).fill('40');

    await page.getByRole('button', { name: /Update Service/i }).click();

    await expect(page.getByText(/€40/i)).toBeVisible();

    await page
      .getByRole('button', { name: /Remove/i })
      .first()
      .click();

    await expect(page.getByText(/Test Service/i)).not.toBeVisible();
  });

  test('should fail to create service with missing data', async ({ page, request }) => {
    const { ownerEmail, password } = await registerOwner(request, {
      testId: `manage-svc-fail-${getTestId()}`,
    });

    await loginThroughUi(page, ownerEmail, password);

    await page.goto('/owner/services');
    await page.getByRole('button', { name: /Add Service/i }).click();

    const createButton = page.getByRole('button', { name: /Create Service/i });

    await expect(createButton).toBeDisabled();

    await page.getByLabel(/Service Name/i).fill('Partial Service');

    await expect(createButton).toBeEnabled();

    await page.getByRole('spinbutton', { name: /Duration/i }).fill('0');

    await expect(createButton).toBeDisabled();

    await page.getByRole('spinbutton', { name: /Duration/i }).fill('30');
    await page.getByRole('spinbutton', { name: /^Price/i }).fill('-1');

    await expect(createButton).toBeDisabled();

    await expect(page.getByText(/^Partial Service$/i)).not.toBeVisible();
  });

  test('should manage team members and handle errors', async ({ page, request }) => {
    const testId = `manage-team-${getTestId()}`;
    const { ownerEmail, password } = await registerOwner(request, { testId });

    await loginThroughUi(page, ownerEmail, password);

    await page.goto('/owner/team');
    await page.getByRole('button', { name: /Add Staff/i }).click();

    await expect(page.getByRole('button', { name: /Create Account|Add to Team/i })).toBeDisabled();

    await page.getByLabel(/Full Name/i).fill('Barber Joe');
    await page.getByLabel(/Email Address/i).fill('invalid-email');
    await page.getByLabel(/Account Password/i).fill('password123');

    await expect(page.getByRole('button', { name: /Create Account|Add to Team/i })).toBeDisabled();

    const staffEmail = `joe_${testId}@example.com`;

    await page.getByLabel(/Email Address/i).fill(staffEmail);
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(page.getByText(/Barber Joe/i)).toBeVisible();
  });

  test('should update opening hours', async ({ page, request }) => {
    const { ownerEmail, password } = await registerOwner(request, {
      testId: `manage-hours-${getTestId()}`,
    });

    await loginThroughUi(page, ownerEmail, password);

    await page.goto('/owner/settings');
    await page.getByRole('tab', { name: /Opening Hours/i }).click();

    const mondayRow = page
      .locator('*')
      .filter({ has: page.getByText(/^Monday$/) })
      .filter({ has: page.getByRole('checkbox') })
      .first();

    const mondaySwitch = mondayRow.getByRole('checkbox').first();

    await mondaySwitch.click();

    await page.getByRole('button', { name: /Save Hours/i }).click();

    await expect(page.getByText(/successfully/i)).toBeVisible();
  });

  test('should manage multiple salons', async ({ page, request }) => {
    const testId = `manage-multi-${getTestId()}`;
    const { ownerEmail, password } = await registerOwner(request, { testId });

    await loginThroughUi(page, ownerEmail, password);

    await page.goto('/owner/settings');
    await page.getByRole('tab', { name: /My Salons/i }).click();

    const secondSalonName = `Second Salon ${testId}`;

    await page.getByRole('button', { name: /Add Salon/i }).click();
    await page.getByLabel(/Salon Name/i).fill(secondSalonName);
    await page.getByRole('button', { name: /Create Salon/i }).click();

    const secondSalonRow = page.locator('li').filter({ hasText: secondSalonName });

    await expect(secondSalonRow).toBeVisible({
      timeout: 15000,
    });

    const switchButton = secondSalonRow.getByRole('button', {
      name: /Switch to this/i,
    });

    if (await switchButton.isEnabled()) {
      await switchButton.click();
    }

    await expect(page.getByText(secondSalonName).first()).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByRole('textbox', { name: /Salon Name/i })).toHaveValue(secondSalonName, {
      timeout: 15000,
    });
  });
});
