import { expect, test } from '@playwright/test';

test('boots into the main menu shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('#app-status')).toHaveAttribute('data-screen', 'main-menu');
  await expect(page).toHaveTitle(/Lintas Malam — Main Menu/);
});

test('starts a run from the main menu', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  // The button is at logical (960, 560); use normalized coordinates so the test covers FIT scaling.
  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  await expect(page.locator('#app-status')).toHaveAttribute('data-screen', 'gameplay');
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
});

test('shows the desktop resolution notice below the supported minimum', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
  await page.goto('/');
  await expect(page.locator('#resolution-notice')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('#resolution-notice')).toBeHidden();
  await page.close();
});

test('loads at both the reference and minimum desktop viewports', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('canvas')).toBeVisible();
  await page.close();
});

test('toggles the M1 debug overlay in gameplay', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  await page.keyboard.press('F3');
  await expect(page.locator('#app-status')).toHaveAttribute('data-debug', 'true');
  await page.keyboard.press('F3');
  await expect(page.locator('#app-status')).toHaveAttribute('data-debug', 'false');
});

test('moves the player and updates mouse aim in the train-relative space', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  const startX = Number(await status.getAttribute('data-player-x'));

  await page.keyboard.down('d');
  await page.waitForTimeout(180);
  await page.keyboard.up('d');
  expect(Number(await status.getAttribute('data-player-x'))).toBeGreaterThan(startX);

  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.35);
  await expect(status).toHaveAttribute('data-aimed', 'true');
  expect(Number(await status.getAttribute('data-aim-x'))).toBeGreaterThan(1000);
});

test('pauses and resumes the gameplay shell with Escape', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Lintas Malam — Paused/);
  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
});
