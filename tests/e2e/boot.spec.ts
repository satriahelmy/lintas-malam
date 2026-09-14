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
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Lintas Malam — Paused/);
  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
});

test('fires a projectile and damages the combat test target', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.mouse.move(box.x + box.width * (1290 / 1920), box.y + box.height * (475 / 1080));
  await page.mouse.click(box.x + box.width * (1290 / 1920), box.y + box.height * (475 / 1080));

  await expect.poll(async () => Number(await status.getAttribute('data-target-hp'))).toBeLessThan(80);
  await expect(status).toHaveAttribute('data-target-active', 'true');
});

test('does not fire while gameplay is paused', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('Escape');
  await page.mouse.click(box.x + box.width * (1290 / 1920), box.y + box.height * (475 / 1080));
  await page.waitForTimeout(180);

  await expect(status).toHaveAttribute('data-target-hp', '80');
  await expect(status).toHaveAttribute('data-projectiles', '0');
});

test('spawns enemies and exposes the active enemy count', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await expect.poll(async () => Number(await status.getAttribute('data-enemies'))).toBeGreaterThanOrEqual(1);

  await page.keyboard.press('F3');
  await page.keyboard.press('5');
  await expect.poll(async () => Number(await status.getAttribute('data-enemies'))).toBeGreaterThanOrEqual(2);
});

test('collects a Scrap pickup exactly once', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('8');

  await expect.poll(async () => Number(await status.getAttribute('data-scrap'))).toBe(5);
  await expect(status).toHaveAttribute('data-pickups', '0');
  await expect(status).toHaveAttribute('data-scrap-collected', '5');
});

test('does not collect Scrap while gameplay is paused', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('8');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(220);

  await expect(status).toHaveAttribute('data-scrap', '0');
  await expect(status).toHaveAttribute('data-pickups', '1');
  await page.keyboard.press('Escape');
  await expect.poll(async () => Number(await status.getAttribute('data-scrap'))).toBe(5);
});

test('opens a three-choice upgrade offer and freezes gameplay until selection', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('9');
  await expect(status).toHaveAttribute('data-upgrade-open', 'true');
  await expect(status).toHaveAttribute('data-screen', 'gameplay');
  await expect.poll(async () => (await status.getAttribute('data-upgrade-offer'))?.split(',').length ?? 0).toBe(3);

  const playerX = await status.getAttribute('data-player-x');
  await page.keyboard.down('d');
  await page.waitForTimeout(180);
  await page.keyboard.up('d');
  await expect(status).toHaveAttribute('data-player-x', playerX ?? '940');

  await page.keyboard.press('1');
  await expect(status).toHaveAttribute('data-upgrade-open', 'false');
  await expect.poll(async () => (await status.getAttribute('data-upgrade-ids'))?.length ?? 0).toBeGreaterThan(0);
});

test('allows dismissing an upgrade offer with Escape', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('9');
  await expect(status).toHaveAttribute('data-upgrade-open', 'true');
  await page.keyboard.press('Escape');

  await expect(status).toHaveAttribute('data-upgrade-open', 'false');
  await expect(status).toHaveAttribute('data-upgrade-ids', '');
});

test('opens a safe station, freezes travel, and departs into the next route phase', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('0');

  await expect(status).toHaveAttribute('data-station-open', 'true');
  await expect(status).toHaveAttribute('data-station-id', 'WANASARI');
  await expect(status).toHaveAttribute('data-route-phase', 'STATION_1');
  const enemiesAtArrival = await status.getAttribute('data-enemies');
  const playerXAtArrival = await status.getAttribute('data-player-x');
  const playerHpAtArrival = await status.getAttribute('data-player-hp');

  await page.keyboard.down('d');
  await page.waitForTimeout(180);
  await page.keyboard.up('d');
  await expect(status).toHaveAttribute('data-player-x', playerXAtArrival ?? '940');
  await expect(status).toHaveAttribute('data-player-hp', playerHpAtArrival ?? '100');
  await expect(status).toHaveAttribute('data-enemies', enemiesAtArrival ?? '1');

  await page.keyboard.press('Enter');
  await expect(status).toHaveAttribute('data-station-open', 'false');
  await expect(status).toHaveAttribute('data-station-id', '');
  await expect(status).toHaveAttribute('data-route-phase', 'BIOME_2');
});

test('uses exactly two station stops in route order', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('0');
  await expect(status).toHaveAttribute('data-station-id', 'WANASARI');
  await page.keyboard.press('Enter');
  await expect(status).toHaveAttribute('data-route-phase', 'BIOME_2');

  await page.keyboard.press('0');
  await expect(status).toHaveAttribute('data-station-id', 'CIBIRU');
  await expect(status).toHaveAttribute('data-route-phase', 'STATION_2');
  await page.keyboard.press('Enter');
  await expect(status).toHaveAttribute('data-route-phase', 'BIOME_3');
  await expect(status).toHaveAttribute('data-station-visited', 'WANASARI,CIBIRU');
});

test('exposes the station survivor rescue hook without changing the roster yet', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('0');
  await page.keyboard.press('N');

  await expect(status).toHaveAttribute('data-station-open', 'true');
  await expect(status).toHaveAttribute('data-survivor-hook', 'true');
  await expect(status).toHaveAttribute('data-station-visited', 'WANASARI');
});

test('repairs a station section and purchases a shared upgrade with Scrap', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('1');
  await page.keyboard.press('8');
  await page.keyboard.press('8');
  await page.keyboard.press('8');
  await page.keyboard.press('8');
  await page.keyboard.press('8');
  await expect(status).toHaveAttribute('data-pickups', '0');
  await expect(status).toHaveAttribute('data-scrap', '25');

  await page.keyboard.press('0');
  await expect(status).toHaveAttribute('data-station-open', 'true');
  await page.keyboard.press('R');
  await expect(status).toHaveAttribute('data-scrap-spent', '10');
  await expect(status).toHaveAttribute('data-scrap', '15');

  await page.keyboard.press('U');
  await expect(status).toHaveAttribute('data-station-upgrade-mode', 'true');
  await expect.poll(async () => (await status.getAttribute('data-upgrade-offer'))?.split(',').length ?? 0).toBe(3);
  await page.keyboard.press('1');
  await expect(status).toHaveAttribute('data-station-upgrade-mode', 'false');
  await expect(status).toHaveAttribute('data-scrap', '0');
  await expect.poll(async () => (await status.getAttribute('data-upgrade-ids'))?.length ?? 0).toBeGreaterThan(0);
});
