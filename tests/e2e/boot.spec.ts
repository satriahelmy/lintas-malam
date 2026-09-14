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

test('loads the M15 player master while keeping the fallback boundary observable', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  await expect(page.locator('#app-status')).toHaveAttribute('data-player-art', 'art-player-idle');
  expect(consoleErrors.filter((message) => /player_idle|missing texture/i.test(message))).toEqual([]);
});

test('loads all four M15.5 train section sprites without changing the train slots', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  await expect(page.locator('#app-status')).toHaveAttribute(
    'data-train-art',
    'DEFENSE:art,WORKSHOP:art,PASSENGER:art,LOCOMOTIVE:art',
  );
  await expect(page.locator('#app-status')).toHaveAttribute('data-route-phase', 'DEPARTURE');
});

test('loads the M15.6 enemy, boss, and survivor masters with fallback diagnostics', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await expect(status).toHaveAttribute('data-enemy-art', 'MIST:art,SHADOW:art,KEEPER:art');
  await expect(status).toHaveAttribute('data-boss-art', 'art-boss-idle');
  await expect(status).toHaveAttribute(
    'data-survivor-art',
    'MONTIR:art,PEDAGANG:art,PERAWAT:art,PENJAGA:art',
  );
  await expect(status).toHaveAttribute('data-route-phase', 'DEPARTURE');
});

test('opens menu settings and credits, and carries session settings into gameplay', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const clickLogical = async (x: number, y: number): Promise<void> => {
    await page.mouse.click(box.x + box.width * (x / 1920), box.y + box.height * (y / 1080));
  };

  await clickLogical(960, 640);
  const status = page.locator('#app-status');
  await expect(page).toHaveTitle(/Lintas Malam — Settings/);
  await expect(status).toHaveAttribute('data-screen-shake', 'true');
  await expect(status).toHaveAttribute('data-audio-volume', '80');

  await clickLogical(960, 535);
  await clickLogical(1120, 600);
  await expect(status).toHaveAttribute('data-screen-shake', 'false');
  await expect(status).toHaveAttribute('data-audio-volume', '90');

  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Lintas Malam — Main Menu/);
  await page.keyboard.press('C');
  await expect(page).toHaveTitle(/Lintas Malam — Credits/);
  await page.keyboard.press('Enter');
  await expect(page).toHaveTitle(/Lintas Malam — Main Menu/);
  await page.keyboard.press('Enter');
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
  await expect(status).toHaveAttribute('data-screen-shake', 'false');
  await expect(status).toHaveAttribute('data-audio-volume', '90');
});

test('exposes state-driven gameplay HUD values and journey markers', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await expect(status).toHaveAttribute('data-player-hp', '100');
  await expect(status).toHaveAttribute('data-scrap', '0');
  await expect(status).toHaveAttribute('data-survivor-count', '0');
  await expect(status).toHaveAttribute('data-route-markers', '33.33,62.5|91.67');
  await expect(status).toHaveAttribute('data-progress', /\d+\.\d+/);
  await expect(status).toHaveAttribute('data-screen-shake', 'true');
  await expect(status).toHaveAttribute('data-audio-volume', '80');
});

test('shows contextual onboarding cues and clears each cue after the matching action', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await expect(status).toHaveAttribute('data-onboarding-moved', 'false');
  await expect(status).toHaveAttribute('data-onboarding-aimed', 'false');
  await expect(status).toHaveAttribute('data-onboarding-attacked', 'false');

  await page.keyboard.down('d');
  await page.waitForTimeout(80);
  await page.keyboard.up('d');
  await expect(status).toHaveAttribute('data-onboarding-moved', 'true');
  await page.mouse.move(box.x + box.width * (1290 / 1920), box.y + box.height * (475 / 1080));
  await expect(status).toHaveAttribute('data-onboarding-aimed', 'true');
  await page.mouse.click(box.x + box.width * (1290 / 1920), box.y + box.height * (475 / 1080));
  await expect(status).toHaveAttribute('data-onboarding-attacked', 'true');
});

test('records live enemy and boss damage sources for balancing audits', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('7');
  await page.keyboard.press('F4');
  await expect.poll(async () => Number(await status.getAttribute('data-enemy-damage-to-train')), { timeout: 5000 }).toBeGreaterThan(0);

  await page.keyboard.press('B');
  await expect.poll(async () => await status.getAttribute('data-boss-intro'), { timeout: 8000 }).toBe('false');
  await expect.poll(async () => Number(await status.getAttribute('data-boss-damage-to-player')), { timeout: 5000 }).toBeGreaterThan(0);
});

test('exposes configured route progress, biome, encounter profile, and reversible debug time scale', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
  const status = page.locator('#app-status');
  const progressBefore = Number(await status.getAttribute('data-progress'));

  await expect(status).toHaveAttribute('data-biome', 'FARMLAND');
  await expect(status).toHaveAttribute('data-encounter-profile', 'EARLY');
  await expect(status).toHaveAttribute('data-route-markers', '33.33,62.5|91.67');
  await page.waitForTimeout(180);
  expect(Number(await status.getAttribute('data-progress'))).toBeGreaterThan(progressBefore);

  await page.keyboard.press('F3');
  await page.keyboard.press('F4');
  await expect(status).toHaveAttribute('data-debug-time-scale', '4');
  await page.keyboard.press('F4');
  await expect(status).toHaveAttribute('data-debug-time-scale', '1');
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
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
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

test('rescues a survivor at the station and exposes the run-local roster', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await expect(page).toHaveTitle(/Lintas Malam — Gameplay Prototype/);
  await page.keyboard.press('F3');
  await page.keyboard.press('0');
  await page.keyboard.press('N');

  await expect(status).toHaveAttribute('data-station-open', 'true');
  await expect(status).toHaveAttribute('data-survivor-hook', 'true');
  await expect(status).toHaveAttribute('data-station-visited', 'WANASARI');
  await expect(status).toHaveAttribute('data-survivor-ids', 'MONTIR');
  await expect(status).toHaveAttribute('data-survivor-count', '1');

  await page.keyboard.press('N');
  await expect(status).toHaveAttribute('data-survivor-ids', 'MONTIR');
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

test('opens the M11 boss gate and freezes regular enemy spawning during the intro', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('B');

  await expect(status).toHaveAttribute('data-route-phase', 'BOSS');
  await expect(status).toHaveAttribute('data-boss-active', 'true');
  await expect(status).toHaveAttribute('data-boss-hp', '900');
  await expect(status).toHaveAttribute('data-boss-state', 'PURSUIT');
  await expect(status).toHaveAttribute('data-boss-intro', 'true');
  await expect(status).toHaveAttribute('data-enemies', '0');
  await expect(page).toHaveTitle(/Raksasa Alas/);

  await expect.poll(async () => await status.getAttribute('data-boss-intro'), { timeout: 8000 }).toBe('false');
});

test('walks the complete deterministic route gate from a clean run to Victory', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('F6');
  await expect(status).toHaveAttribute('data-route-phase', 'BIOME_1');
  await page.keyboard.press('F6');
  await expect(status).toHaveAttribute('data-station-id', 'WANASARI');
  await page.keyboard.press('F6');
  await expect(status).toHaveAttribute('data-route-phase', 'BIOME_2');
  await page.keyboard.press('F6');
  await expect(status).toHaveAttribute('data-station-id', 'CIBIRU');
  await page.keyboard.press('F6');
  await expect(status).toHaveAttribute('data-route-phase', 'BIOME_3');
  await page.keyboard.press('F6');
  await expect(status).toHaveAttribute('data-boss-active', 'true');
  await expect.poll(async () => await status.getAttribute('data-boss-intro'), { timeout: 8000 }).toBe('false');

  await page.keyboard.press('C');
  await page.keyboard.press('C');
  await page.keyboard.press('C');
  await expect(status).toHaveAttribute('data-result-outcome', 'VICTORY');
  await expect(status).toHaveAttribute('data-route-phase', 'DESTINATION');
});

test('transitions from boss PURSUIT to ENRAGED and exposes the victory hook', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('B');
  await expect(status).toHaveAttribute('data-boss-active', 'true');
  await expect.poll(async () => await status.getAttribute('data-boss-intro'), { timeout: 8000 }).toBe('false');

  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Paused/);
  await page.waitForTimeout(700);
  await expect(status).toHaveAttribute('data-boss-hp', '900');
  await page.keyboard.press('Escape');
  await expect(page).toHaveTitle(/Raksasa Alas/);

  await page.keyboard.press('C');
  await expect(status).toHaveAttribute('data-boss-hp', '600');
  await page.keyboard.press('C');
  await expect(status).toHaveAttribute('data-boss-hp', '300');
  await expect(status).toHaveAttribute('data-boss-state', 'ENRAGED');
  await page.keyboard.press('C');

  await expect(status).toHaveAttribute('data-boss-active', 'false');
  await expect(status).toHaveAttribute('data-boss-defeated', 'true');
  await expect(status).toHaveAttribute('data-route-phase', 'DESTINATION');
  await expect(status).toHaveAttribute('data-result-outcome', 'VICTORY');
  await expect(status).toHaveAttribute('data-result-reason', 'DESTINATION_REACHED');
  await expect(status).toHaveAttribute('data-scrap', '100');
  await expect(page).toHaveTitle(/Victory — Destination/);
});

test('shows Game Over for player defeat and retries into a clean run without refresh', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  await page.keyboard.press('X');

  await expect(status).toHaveAttribute('data-result-outcome', 'GAME_OVER');
  await expect(status).toHaveAttribute('data-result-reason', 'PLAYER_DOWN');
  await expect(status).toHaveAttribute('data-player-hp', '0');
  await expect(page).toHaveTitle(/Game Over/);

  await page.keyboard.press('R');
  await expect(page).toHaveTitle(/Gameplay Prototype/);
  await expect(status).toHaveAttribute('data-result-outcome', '');
  await expect(status).toHaveAttribute('data-player-hp', '100');
  await expect(status).toHaveAttribute('data-route-phase', 'DEPARTURE');

  await page.keyboard.press('M');
  await expect(page).toHaveTitle(/Main Menu/);
  await page.keyboard.press('Enter');
  await expect(page).toHaveTitle(/Gameplay Prototype/);
  await expect(status).toHaveAttribute('data-player-hp', '100');
});

test('shows Game Over when the locomotive reaches zero HP', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * (960 / 1920), box.y + box.height * (560 / 1080));
  const status = page.locator('#app-status');
  await page.keyboard.press('F3');
  for (let index = 0; index < 7; index += 1) await page.keyboard.press('4');

  await expect(status).toHaveAttribute('data-result-outcome', 'GAME_OVER');
  await expect(status).toHaveAttribute('data-result-reason', 'LOCOMOTIVE_FAILED');
  await expect(page).toHaveTitle(/Game Over/);

  await page.keyboard.press('R');
  await expect(page).toHaveTitle(/Gameplay Prototype/);
  await expect(status).toHaveAttribute('data-player-hp', '100');
  await expect(status).toHaveAttribute('data-route-phase', 'DEPARTURE');
});
