import { expect, test } from '@playwright/test';
import { loginThroughUi, onboardStaff, registerOwner } from './helpers';

test.describe('Time Off Workflow', () => {
  const getTestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  test('should request and approve time off', async ({ page, request }) => {
    const testId = getTestId();
    const staffEmail = `timeoff_staff_${testId}@example.com`;
    const password = 'password123';

    const { ownerEmail, accessToken } = await registerOwner(request, {
      testId: `timeoff-${testId}`,
    });

    await onboardStaff(request, accessToken, {
      name: 'TimeOff Barber',
      email: staffEmail,
      password,
    });

    await loginThroughUi(page, staffEmail, password);
    await expect(page).toHaveURL(/\/staff/);

    await page.goto('/staff/time-off');
    await page.getByRole('button', { name: /New Request/i }).click();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];

    await page.getByLabel(/Start Date/i).fill(dateStr);
    await page.getByLabel(/End Date/i).fill(dateStr);
    await page.getByLabel(/Reason/i).fill('Family vacation');
    await page.getByRole('button', { name: /Submit Request/i }).click();

    await expect(page.getByText(/Requested/i)).toBeVisible();

    await page.evaluate(() => window.localStorage.clear());
    await loginThroughUi(page, ownerEmail, password);
    await expect(page).toHaveURL(/\/owner/);

    await page.goto('/owner/team');
    await page.getByRole('button', { name: /Requests/i }).first().click();
    await page.getByRole('button', { name: /Approve/i }).click();
    await expect(page.getByText(/Request approved successfully/i)).toBeVisible();
  });
});
