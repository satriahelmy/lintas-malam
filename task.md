# Lintas Malam V1 — Implementation Task Plan

Status: active implementation plan. M1–M8 are implemented incrementally with placeholder visuals only; final art and later V1 systems remain gated by the milestone plan.

## Source of truth and V1 guardrails

Implement against these documents, in this order when requirements conflict:

1. `PRD.md — Lintas Malam.md` for product scope and acceptance criteria.
2. `design.md — Lintas Malam.md` for interaction, layout, camera, UI, and game-feel direction.
3. `art-direction.md — Lintas Malam.md` for visual and asset constraints.

V1 is a local, desktop-browser, 10–15 minute top-down train-survival run:

`Main Menu → Departure → Farmland → Station 1 → Plantation & Forest → Station 2 → Highland Night → Raksasa Alas → Destination`

The V1 content budget is fixed at:

- 3 regular enemy archetypes: The Mist, The Shadow, and The Keeper.
- 1 final boss: Raksasa Alas, with at least two behavior states.
- 4 train sections: Locomotive, Passenger Car, Workshop Car, Defense Car.
- 4 survivor archetypes: Montir, Pedagang, Perawat, Penjaga.
- 2 station stops, both safe zones with no enemy attacks.
- 1 base player weapon whose characteristics are changed by upgrades.

Prototype work uses shapes, simple temporary sprites, and functional placeholder UI. Final art generation and asset integration begin only after the playable prototype gate in Milestone 14 is passed.

## Recommended technical stack

The repository currently contains the three design documents and does not define an application stack. Use the smallest maintainable desktop-web stack:

- Vite for local development and production bundling. The build runs on the developer machine (or an optional CI job), not on the PHP host.
- TypeScript for application and domain code.
- Phaser 3 for the Canvas/WebGL game loop, input, sprites, camera, scenes, and lightweight collision handling.
- HTML/CSS overlays for menus and information-dense UI where native text layout and accessibility are useful; keep gameplay rendering in Phaser.
- Vitest for deterministic unit tests of domain rules and systems.
- Playwright for browser smoke tests and a small number of end-to-end flow tests.
- ESLint and TypeScript strict mode for static checks.

The deployment target is PHP shared hosting. PHP is only the hosting environment; it is not part of the game runtime. Deploy the generated static build (`index.html`, JavaScript, CSS, images, and audio) to Apache via cPanel File Manager, FTP, or the host's equivalent. The server must not need Node.js, a database, a PHP endpoint, or a runtime API for the game to work.

Do not add a backend, runtime API dependency, authentication, or external service. Core gameplay must run from a local static build with all approved assets stored in the project.

Recommended runtime choices:

- Use a fixed logical design viewport of 1920×1080 and scale proportionally down to 1280×720.
- Keep the train in a train-relative gameplay coordinate space. Scroll environment layers right-to-left to imply forward movement; do not make the whole combat simulation depend on a physically moving train sprite.
- Use integer-friendly pixel rendering and disable smoothing/anti-aliasing where Phaser and the browser allow it.
- Use seeded or injectable randomness in encounter systems so tests and balance sessions can be reproduced. A seed is run-local only and is not saved between runs.
- Keep game rules in plain TypeScript modules that can be tested without booting Phaser. Phaser objects should be view/input adapters around those rules.
- Build with relative asset URLs (`base: './'` or an equivalent deployment-safe setting) so the game works at the domain root and inside a subfolder such as `/lintas-malam/`.
- Keep the production output self-contained and static. Do not use server-side rendering, WebSockets, PHP routes, absolute `/assets/...` URLs, or assumptions that the game is hosted at `/`.

## PHP shared hosting deployment plan

The game should be developed and tested with Node.js locally, then uploaded as static files. The PHP host does not need to compile or execute the TypeScript/Phaser source.

### Hosting assumptions

- Apache-style static file serving is available, as is typical for PHP shared hosting.
- HTTPS is preferred and should be enabled if the host provides a free certificate. Core gameplay should not depend on a PHP API; browser audio still must start from a user gesture because of autoplay rules.
- The host can serve JavaScript modules or the bundled JavaScript emitted by Vite, PNG/WebP images, fonts if used, and audio files.
- The game is uploaded either to the document root or a dedicated subfolder such as `public_html/lintas-malam/`.

### Build and upload workflow

1. Install dependencies on the development machine and run typecheck, tests, and `npm run build`.
2. Inspect the generated `dist/` directory. It must contain the entry HTML and all referenced static assets; do not upload `src/` as the runtime application.
3. Upload the contents of `dist/` into `public_html/` or `public_html/lintas-malam/` using cPanel or FTP. Keep the generated directory structure intact.
4. If direct navigation to an application route is ever introduced, include a minimal `.htaccess` fallback that rewrites unknown document paths to `index.html` while leaving real files/directories and asset extensions untouched. Prefer hash/history-free navigation in V1 so this fallback is optional.
5. Open the deployed URL in a desktop browser and verify asset loading, mouse input, audio-after-Play behavior, refresh, and Retry. Test both domain-root and subfolder deployment if both are possible.

### Hosting restrictions to preserve

- Do not require Composer, a PHP framework, a cron job, a database, PHP sessions, or writable server storage.
- Do not place secrets, API keys, or credentials in the build.
- Do not add server-side save data. All run state is in memory and is discarded on Retry or page close.
- Do not use absolute asset paths that work only on one deployment location.
- Keep an optional `.htaccess.example` in the project as deployment documentation; the generated build may include `.htaccess` only if the host requires it.

### Deployment artifact shape

```text
dist/
├─ index.html
├─ assets/
│  ├─ *.js
│  ├─ *.css
│  ├─ images and game assets
│  └─ audio files
└─ .htaccess              # optional; only if direct-route fallback is needed
```

## Recommended folder structure

Create this structure during project setup. Keep names descriptive and avoid generic asset names such as `image1.png` or `generated_new.png`.

```text
lintas-malam/
├─ public/
│  └─ assets/
│     ├─ characters/
│     ├─ enemies/
│     ├─ train/
│     ├─ environment/
│     │  ├─ biome_farmland/
│     │  ├─ biome_plantation_forest/
│     │  └─ biome_highland/
│     ├─ stations/
│     ├─ ui/
│     ├─ fx/
│     └─ audio/
├─ src/
│  ├─ main.ts
│  ├─ game/
│  │  ├─ game-config.ts
│  │  ├─ scene-keys.ts
│  │  └─ create-game.ts
│  ├─ core/
│  │  ├─ game-state.ts
│  │  ├─ run-state.ts
│  │  ├─ events.ts
│  │  ├─ clock.ts
│  │  └─ random.ts
│  ├─ data/
│  │  ├─ player-config.ts
│  │  ├─ train-config.ts
│  │  ├─ enemy-config.ts
│  │  ├─ upgrade-config.ts
│  │  ├─ survivor-config.ts
│  │  ├─ biome-config.ts
│  │  ├─ station-config.ts
│  │  └─ boss-config.ts
│  ├─ entities/
│  │  ├─ player/
│  │  ├─ train/
│  │  ├─ enemy/
│  │  ├─ projectile/
│  │  ├─ pickup/
│  │  ├─ survivor/
│  │  └─ boss/
│  ├─ systems/
│  │  ├─ movement-system.ts
│  │  ├─ camera-system.ts
│  │  ├─ combat-system.ts
│  │  ├─ enemy-spawn-system.ts
│  │  ├─ damage-system.ts
│  │  ├─ pickup-system.ts
│  │  ├─ upgrade-system.ts
│  │  ├─ station-system.ts
│  │  ├─ progression-system.ts
│  │  ├─ boss-system.ts
│  │  └─ balance-metrics.ts
│  ├─ scenes/
│  │  ├─ boot-scene.ts
│  │  ├─ preload-scene.ts
│  │  ├─ menu-scene.ts
│  │  ├─ gameplay-scene.ts
│  │  ├─ upgrade-scene.ts
│  │  ├─ station-scene.ts
│  │  └─ result-scene.ts
│  ├─ ui/
│  │  ├─ hud.ts
│  │  ├─ pause-overlay.ts
│  │  ├─ upgrade-panel.ts
│  │  ├─ station-panel.ts
│  │  ├─ onboarding.ts
│  │  └─ result-panels.ts
│  ├─ rendering/
│  │  ├─ placeholder-renderer.ts
│  │  ├─ parallax-background.ts
│  │  ├─ effects.ts
│  │  └─ pixel-rendering.ts
│  ├─ audio/
│  │  ├─ audio-manager.ts
│  │  └─ sound-catalog.ts
│  └─ styles/
│     └─ ui.css
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
└─ task.md
```

## Recommended architecture and module boundaries

- `GameState`: owns the high-level state machine (`MAIN_MENU`, `PLAYING`, `UPGRADE`, `STATION`, `BOSS`, `VICTORY`, `GAME_OVER`, and `PAUSED`). Only one system should be able to transition the state, and every transition should have a clear exit condition.
- `RunState`: owns run-local values: progress, current biome/phase, player state, train sections, scrap, kills, rescued survivors, upgrade levels, elapsed time, and the run seed. It is reset for Retry and discarded on returning to the menu.
- Data modules: define typed, immutable balancing data. Enemy, upgrade, survivor, biome, station, and boss definitions should not be embedded inside scene classes.
- Domain systems: apply movement, damage, targeting, drops, upgrades, repair, station actions, progression, and boss behavior. They should accept time, state, and injected randomness so important rules are unit-testable.
- Phaser entities/views: own sprite positions, animations, hitboxes, effects, and input bindings. They reflect domain state rather than becoming the source of truth for HP, scrap, or progression.
- Event bus: use typed events for cross-cutting feedback such as `player-damaged`, `train-section-damaged`, `enemy-defeated`, `scrap-collected`, `upgrade-offered`, `station-arrived`, `boss-introduced`, and `run-ended`. Events should not hide gameplay rules.
- Scene boundaries: use scenes or scene layers for boot, menu, gameplay, upgrade, station, and results. Pausing and overlays must stop simulation updates rather than merely hiding sprites.
- Coordinate spaces: keep a documented conversion between screen coordinates, train-relative gameplay coordinates, and parallax layer coordinates. Mouse aim must use the same conversion in every supported viewport.
- No global mutable singleton for all gameplay. A single run/session context may be passed to systems, but ownership must remain explicit.

## Implementation order and dependency path

1. M1: project setup, build, viewport, scene shell, typed configuration, and test harness.
2. M2: train-relative coordinate model, player movement, mouse mapping, camera, and placeholder travel motion.
3. M3: four train sections, HP, damage states, and locomotive failure condition.
4. M4: base weapon, aiming, projectiles, collision, and damage feedback.
5. M5: enemy lifecycle, targeting, movement, attacks, and all three regular archetypes.
6. M6: Scrap drops, pickup, run-local economy, and reset behavior.
7. M7: upgrade data, 1-of-3 offers, application, pause/resume, and train/player/defense effects.
8. M8: reusable station flow, repair/purchase/rescue hooks, safe-zone behavior, and departure.
9. M9: survivor data, four passive bonuses, presentation, and passenger-car interaction.
10. M10: route phases, three biomes, station markers, encounter composition, and difficulty ramp.
11. M11: boss encounter, two behavior states, intro, and destination unlock.
12. M12: victory, game over, result statistics, retry, and menu return.
13. M13: complete functional HUD and screens, including onboarding and accessibility controls.
14. M14: balancing and game-feel pass; this is the playable prototype gate.
15. M15: final art direction pass and modular asset integration.
16. M16: audio, visual effects, transitions, and polish.
17. M17: full V1 QA, performance, scope audit, and release build verification.

Minimal debug HUD and placeholder labels may be added as needed before M13. M13 is the pass for the intended UI structure and content, not permission to spend time on visual decoration before the gameplay gate.

# Milestones

## M1 — Project setup and architecture

### Objective

Create a locally runnable, type-safe desktop-browser game shell with a maintainable module structure and no backend dependency.

### Status

Complete. The M1 shell is implemented and verified locally; later gameplay milestones remain untouched.

### Tasks

- [x] M1.1 Confirm the repository has no existing application stack to preserve; initialize Vite, TypeScript, Phaser, Vitest, Playwright, ESLint, and strict type checking.
- [x] M1.2 Add scripts for development, production build, preview, typecheck, lint, unit tests, and browser smoke tests.
- [x] M1.3 Add boot and preload flow with a loading fallback, then route to a minimal main menu scene.
- [x] M1.4 Define scene keys, game states, typed entity IDs, event names, and the initial `RunState` shape.
- [x] M1.5 Configure the 1920×1080 reference viewport, proportional scaling to 1280×720, landscape desktop assumptions, and a below-minimum-resolution notice.
- [x] M1.6 Add a resettable session context. Do not add save files, cloud state, authentication, or persistent progression.
- [x] M1.7 Add a placeholder rendering layer and a debug toggle for bounding boxes, entity IDs, and current game state.
- [x] M1.8 Document the coordinate-space decision and the rule that all gameplay rules live outside Phaser scene classes where practical.
- [x] M1.9 Configure a deployment-safe static build: relative asset URLs, subfolder-safe base path, no server-side rendering, and no runtime PHP/Node requirement.
- [x] M1.10 Add a deployment note/example for cPanel or FTP, including the expected `dist/` upload contents and an optional `.htaccess` fallback that does not intercept real assets.

### Dependencies

None. This is the foundation for every later milestone.

### Acceptance criteria

- A developer can install dependencies, start the local dev server, open the game in a desktop browser, and reach the main menu.
- A production build completes without type errors or missing imports.
- The production output is self-contained and can be served by PHP shared hosting as static files without Node.js, a database, or a PHP endpoint.
- Asset URLs resolve when the build is hosted at the domain root and in a subfolder such as `/lintas-malam/`.
- The game scales from 1920×1080 to 1280×720 without stretching gameplay coordinates incorrectly.
- The game does not make a network request for core gameplay after loading.
- A new run can be created and discarded in memory.
- No application code or final art is hidden in an undocumented global or ad hoc file.

### Test checklist

- [x] Fresh install and local boot.
- [x] Production build and preview server.
- [x] Serve the generated `dist/` as static files from a local subfolder and verify all scripts/assets load.
- [x] Inspect build output for accidental absolute paths, missing assets, secrets, or server-runtime assumptions.
- [x] Browser smoke test reaches the main menu.
- [x] Resize tests at 1920×1080 and 1280×720.
- [x] Below-minimum viewport notice appears without crashing.
- [x] Typecheck and lint pass.
- [x] Reset session state twice and verify no values leak between runs.

## M2 — Core gameplay movement and camera

### Objective

Make the player controllable and make the train-relative layout communicate forward travel while preserving a stable combat space.

### Status

Complete. Player movement, mouse aim, train-relative bounds, placeholder parallax, contextual onboarding, and pause/resume hooks are implemented and verified locally.

### Tasks

- [x] M2.1 Define the playable train-relative bounds and the default four-section train layout, with the train slightly left of screen center and room to see the direction of travel.
- [x] M2.2 Implement normalized WASD movement with configurable speed, diagonal-speed correction, and movement bounds around/on the train.
- [x] M2.3 Implement mouse-to-world coordinate conversion and a visible temporary aim direction/crosshair. Keep Left Click bound for the future weapon system.
- [x] M2.4 Keep the camera stable; do not follow small player movement. Add a short, configurable camera-shake service with a default-off or very-low placeholder.
- [x] M2.5 Add placeholder parallax bands for far background, background, midground, gameplay layer, and sparse foreground. Scroll environmental layers right-to-left while the train remains the anchor.
- [x] M2.6 Add contextual onboarding prompts for WASD, Mouse, and Left Click. Each prompt disappears after the corresponding action and does not block play.
- [x] M2.7 Add the first pause input hook on `Esc`, even if the final pause panel is completed in M13.

### Dependencies

M1.

### Acceptance criteria

- The player moves responsively with WASD and cannot leave the intended train combat envelope.
- Aiming remains correct at both reference and minimum supported viewport sizes.
- The train remains the visual/gameplay anchor while the placeholder world scrolls in the opposite direction.
- Movement does not cause continuous camera bobbing or uncontrolled shake.
- A new player can begin moving and aiming in under 10 seconds without a tutorial modal.

### Test checklist

- [x] WASD movement in all four directions.
- [x] Diagonal movement is not faster than cardinal movement.
- [x] Player stops at every gameplay boundary.
- [x] Mouse aim is correct after resize and browser scaling.
- [x] Aim remains responsive while the player moves.
- [x] Environment scroll direction and speed are correct.
- [x] `Esc` pauses simulation and a second action can resume it.
- [x] Camera remains stable during ordinary movement.

## M3 — Train system

### Objective

Make the train a real objective with independent section health, readable damage states, and an unambiguous locomotive failure condition.

### Status

Complete. The four-section train state, damage/repair rules, condition feedback, locomotive terminal event, support hooks, and stop/resume behavior are implemented and verified locally.

### Tasks

- [x] M3.1 Define typed train-section data for Locomotive, Passenger Car, Workshop Car, and Defense Car: current HP, max HP, hitbox, position, condition thresholds, and repairability.
- [x] M3.2 Render all four sections with distinct placeholder silhouettes and a stable layout. Keep the default order `[Defense]—[Workshop]—[Passenger]—[Locomotive]` unless camera testing justifies reversing it.
- [x] M3.3 Implement section-specific damage, clamping, damage events, and condition states: healthy, damaged, and critical.
- [x] M3.4 Make Locomotive HP reaching zero emit exactly one terminal failure event. Player HP reaching zero remains a separate terminal condition for M12.
- [x] M3.5 Add train stop/resume hooks so station phases can freeze travel and train-related simulation cleanly.
- [x] M3.6 Add interfaces for Workshop repair effectiveness and Defense Car passive attack without implementing their final bonuses yet.
- [x] M3.7 Add placeholder visual/audio hooks for sparks, smoke, flicker, and instability based on section condition. Keep effects minimal and temporary.

### Dependencies

M1 and M2. M4 and M5 consume the damage and hitbox interfaces.

### Acceptance criteria

- All four train sections are independently identifiable and have independent HP.
- Damage to one section never changes another section unless a later explicit effect says so.
- Locomotive failure is a reliable game-ending signal and cannot be accidentally bypassed by negative HP or duplicate events.
- Healthy, damaged, and critical states are visually distinguishable using more than a color change.
- The train can be stopped and resumed without losing its state.

### Test checklist

- [x] Damage each section independently.
- [x] Verify HP clamps at zero and max HP.
- [x] Verify condition transitions at each threshold.
- [x] Verify critical Locomotive damage emits one failure event.
- [x] Verify repairing later cannot revive a terminally failed run.
- [x] Verify stop/resume preserves HP and section positions.
- [x] Verify all section hitboxes match their placeholder visuals.

## M4 — Combat system

### Objective

Implement the responsive, grounded base weapon that lets the player defend the train in real time.

### Status

Complete. The configurable base weapon, mouse firing, projectile lifecycle, target collision, hit feedback, player damage intake, invulnerability window, and paused-state firing guard are implemented and verified locally.

### Tasks

- [x] M4.1 Define one base weapon with damage, fire rate, projectile speed, range, cooldown, and aim behavior in configuration.
- [x] M4.2 Bind Left Click to fire only during active gameplay, using the current aim direction and weapon cooldown.
- [x] M4.3 Implement a lightweight projectile lifecycle: spawn, travel, collision, range expiry, and cleanup. Use pooling if profiling shows it is needed.
- [x] M4.4 Implement a single damage interface shared by player projectiles, enemy attacks, and train damage.
- [x] M4.5 Add restrained placeholder feedback: visible projectile, brief hit flash, small impact marker, and optional short damage indication.
- [x] M4.6 Add player damage intake with a short invulnerability window or attack cooldown protection so contact cannot lock the player indefinitely.
- [x] M4.7 Block firing while paused, in Upgrade/Station screens, dead, or during a terminal result state.

### Dependencies

M2 for input/aim and M3 for train damage interfaces. M5 supplies live enemy targets.

### Acceptance criteria

- The player can aim and fire one weapon with the mouse while moving.
- Projectiles visibly travel, hit valid targets, deal configured damage, and disappear when expired.
- Fire rate, damage, and range are deterministic and later adjustable by upgrades.
- Combat feedback is readable without giant damage numbers, constant shake, or excessive particles.
- Pausing or leaving gameplay cannot create extra shots or damage.

### Test checklist

- [x] Fire in eight or more aim directions.
- [x] Verify cooldown and fire-rate changes.
- [x] Verify projectile collision with a target and with no target.
- [x] Verify projectiles expire at range and do not accumulate off-screen.
- [x] Verify damage is applied once per projectile hit.
- [x] Verify player damage and invulnerability timing.
- [x] Verify no shots fire during pause, upgrade, station, or results.
- [x] Run a basic projectile-count/performance check.

## M5 — Enemy system

### Objective

Add the three regular enemy archetypes with distinct silhouettes, movement, targeting, attacks, death, and cleanup behavior.

### Status

Complete. Mist, Shadow, and Keeper now have data-driven stats, safe side-based spawning, distinct movement profiles, stable target selection, cooldown-based attacks, hit/death/drop events, placeholder silhouettes, and an active-enemy cap.

### Tasks

- [x] M5.1 Define enemy data for The Mist, The Shadow, and The Keeper: HP, speed, damage, attack interval, target rules, drop value, size, and spawn weight.
- [x] M5.2 Implement an enemy lifecycle: spawn, active movement, attack cooldown, hit reaction, death event, drop event, and removal.
- [x] M5.3 Implement safe spawn points around the upper side, lower side, rear, and occasional front of the train. Do not spawn directly on top of the player.
- [x] M5.4 Implement The Mist as the common, low-HP, direct-moving threat that pressures the nearest train section.
- [x] M5.5 Implement The Shadow as a fast, irregular-moving threat that can prioritize the player or a weak train section.
- [x] M5.6 Implement The Keeper as a slow, high-HP, high-train-damage priority target with visibly heavier movement.
- [x] M5.7 Add targeting and retargeting rules that remain understandable and avoid enemies switching targets every frame.
- [x] M5.8 Add an active-enemy cap and cleanup policy to protect 60 FPS. Keep the cap in data for later balancing.
- [x] M5.9 Use placeholder shapes/silhouettes only; distinguish archetypes by shape and movement, not color alone.

### Dependencies

M3 and M4. M6 consumes enemy defeat/drop events; M10 later controls composition and intensity.

### Acceptance criteria

- All three regular enemy archetypes can spawn, move, attack, take damage, and die.
- The three archetypes are distinguishable in grayscale by silhouette and movement.
- Enemies can pressure both the player and train according to explicit target rules.
- Death happens once, produces one defeat event, and removes the enemy from active simulation.
- Spawn safety and the active cap prevent unfair overlap and runaway entity counts.

### Test checklist

- [x] Spawn each archetype from each supported spawn side.
- [x] Verify no spawn overlaps the player or train hitboxes.
- [x] Verify each movement profile and target priority.
- [x] Verify enemy attack cooldown and damage routing.
- [x] Verify enemy hit reaction and one-time death event.
- [x] Verify enemies stop attacking while paused or in a safe station.
- [x] Verify active cap, off-screen cleanup, and no orphaned timers.
- [x] Run a grayscale screenshot/readability check with mixed archetypes.

## M6 — Scrap and pickup system

### Objective

Create the run-local Scrap economy that rewards combat and supports repair, station actions, and upgrades.

### Status

Complete. Enemy drops now create duplicate-safe, readable Scrap pickups; pickups attract and collect within a clear radius; run-local add/spend/refund/reward APIs validate balances; HUD diagnostics expose the economy; and all economy state resets with a new run.

### Tasks

- [x] M6.1 Define Scrap drop values and drop probability per enemy, with optional encounter reward support.
- [x] M6.2 Spawn a visible temporary Scrap pickup from eligible enemy defeat events. Prevent duplicate drops from duplicate death events.
- [x] M6.3 Implement pickup detection within a clear radius. A subtle attraction/bounce may be used only if it improves readability and responsiveness.
- [x] M6.4 Add run-local Scrap count, total collected statistic, and spend/refund methods with non-negative validation.
- [x] M6.5 Add station and upgrade reward hooks without coupling the pickup object to station UI.
- [x] M6.6 Reset Scrap and all economy statistics when Retry starts a new run; never carry them to a later run.

### Dependencies

M5 for defeat events and M1 for `RunState`. M7 and M8 consume the economy API.

### Acceptance criteria

- Defeated enemies can drop readable Scrap pickups and the player can collect them.
- Scrap is added exactly once per pickup and cannot become negative through spending.
- Enemy drops, encounter rewards, and station rewards use the same run-local economy.
- Retry resets Scrap, collected total, and all spending history.
- No pickup is a giant glowing loot crystal; placeholder readability is sufficient for prototype.

### Test checklist

- [x] Verify drop values for each enemy archetype.
- [x] Verify pickup radius and collection while moving.
- [x] Verify a pickup cannot be collected twice.
- [x] Verify spending, insufficient-funds behavior, and non-negative balance.
- [x] Verify station reward and encounter reward paths.
- [x] Verify pickups stop updating in pause/station and are reset on Retry.
- [x] Verify pickup cleanup and entity count during a long combat sample.

## M7 — Upgrade system

### Objective

Give the player meaningful, readable, run-local build choices through a simple 1-of-3 upgrade offer without a skill tree or inventory system.

### Status

Complete. The six V1 upgrade definitions, max-level filtering, milestone offer director, pause-safe three-choice overlay, player/train effects, Emergency Repair, passive Defense Turret, and run-local upgrade tracking are implemented and verified locally.

### Tasks

- [x] M7.1 Define typed upgrade definitions and max levels for Rapid Fire, Heavy Round, Long Barrel, Reinforced Carriage, Emergency Repair, and Defense Turret.
- [x] M7.2 Implement a minimal offer director driven by configurable progress/encounter milestones, not a new XP or meta-progression system.
- [x] M7.3 Generate three valid, non-duplicate choices. Avoid offering maxed upgrades when alternatives exist.
- [x] M7.4 Pause gameplay while the offer is open and resume only after a valid selection or explicit allowed dismissal.
- [x] M7.5 Apply player upgrades to fire rate, damage, range, and other weapon stats.
- [x] M7.6 Apply Reinforced Carriage to train max HP while preserving a clear rule for current HP adjustment.
- [x] M7.7 Implement Emergency Repair through the shared repair API.
- [x] M7.8 Implement Defense Turret as a simple passive Defense Car attack, with no weapon inventory or turret customization.
- [x] M7.9 Display active upgrade names/levels in a compact placeholder panel and record them in the result summary if useful.

### Dependencies

M3, M4, and M6. M8 may reuse the catalog for station purchases.

### Acceptance criteria

- At least one upgrade offer appears during a run and presents three readable choices.
- A selected upgrade applies exactly once and affects the intended system.
- Gameplay is frozen while selecting and resumes with no skipped damage, shots, or timers.
- Upgrade stacking is bounded by configured levels and does not require a skill tree.
- Emergency Repair and Defense Turret are functional, not merely labels.
- Upgrade state is run-local and resets on Retry.

### Test checklist

- [x] Verify three unique valid choices.
- [x] Verify max-level filtering and repeated offers.
- [x] Verify selection applies one time only.
- [x] Verify simulation, enemy attacks, projectiles, and timers freeze during selection.
- [x] Verify each weapon stat change numerically.
- [x] Verify Reinforced Carriage max/current HP behavior.
- [x] Verify Emergency Repair cannot exceed max HP.
- [x] Verify Defense Turret attack cadence, targeting, and cleanup.
- [x] Verify upgrades reset on Retry.

## M8 — Station system

### Objective

Implement the two short, safe station phases where players can make repair, upgrade, and survivor decisions without breaking travel flow.

### Status

Complete. Wanasari and Cibiru use shared station data and a reusable safe-zone overlay with train repair, shared upgrade purchases, the M9 survivor rescue hook, and one-time departure transitions.

### Tasks

- [x] M8.1 Define reusable station data: fictional name, arrival progress, available actions, costs, visual label, and reward/rescue availability.
- [x] M8.2 Trigger a station transition at the end of Biome 1 and Biome 2. Slow/stop travel and show a brief arrival state.
- [x] M8.3 Suspend enemy spawning and enemy attacks for the entire station phase. Preserve current run state.
- [x] M8.4 Implement a station overlay that keeps the gameplay view visible and exposes current Scrap and train condition.
- [x] M8.5 Implement `Repair Train` as a clear action on a selected damaged section, using a configurable cost and the Workshop bonus.
- [x] M8.6 Reuse the upgrade system for a station upgrade purchase/reward without creating a second upgrade model.
- [x] M8.7 Add a `Rescue Survivor` action hook for M9, including availability and duplicate/roster validation.
- [x] M8.8 Add a `Depart` action that exits the station cleanly and resumes the next travel phase.
- [x] M8.9 Keep each station interaction within the intended 20–40 second flow; do not build an RPG shop or dialogue screen.

### Dependencies

M3, M6, and M7. M9 supplies survivor recruitment behavior; M10 supplies exact route markers.

### Acceptance criteria

- A station can be reached, entered, interacted with, and departed without a page refresh.
- No enemy damage or spawning occurs while the station is active.
- Repair spends Scrap correctly, heals only the selected section, and respects max HP and Workshop modifiers.
- Station upgrade and survivor actions use shared systems and show valid unavailable/insufficient-funds states.
- Travel resumes at the correct next phase after `Depart`.

### Test checklist

- [x] Trigger a station from travel and verify arrival transition.
- [x] Verify enemies freeze/clear safely and cannot damage the player/train.
- [x] Repair each damaged section and verify costs/bonuses.
- [x] Verify repair cannot exceed max HP or spend negative Scrap.
- [x] Verify upgrade purchase and insufficient-funds state.
- [x] Verify survivor availability and duplicate handling through the M9 hook contract.
- [x] Verify Depart resumes travel exactly once.
- [x] Verify station can be entered and exited twice in one run.

## M9 — Survivor system

### Objective

Make survivors visible human participants with simple passive benefits tied to the train and station decisions.

### Tasks

- [ ] M9.1 Define four data-driven survivor archetypes: Montir, Pedagang, Perawat, and Penjaga, with display name, silhouette placeholder, and passive definition.
- [ ] M9.2 Implement a run-local survivor roster and survivor count. Survivors must be represented by characters/sprites or placeholders, not only by numeric modifiers.
- [ ] M9.3 Implement Montir: repair effectiveness +25% or the equivalent configured value.
- [ ] M9.4 Implement Pedagang: station purchase cost reduction with a non-negative final cost.
- [ ] M9.5 Implement Perawat: a small, bounded player health-recovery effect. Use one simple documented trigger, preferably modest regeneration after a configurable no-damage delay.
- [ ] M9.6 Implement Penjaga: increased train/Defense Car effectiveness through the shared defense modifier.
- [ ] M9.7 Implement the Passenger Car interaction: severe passenger-car damage reduces or disables a configured portion of survivor benefits, and recovery restores the benefit according to the chosen rule.
- [ ] M9.8 Present a rescued survivor with a small grounded character presentation and passive description. Do not add dialogue trees, rarity, or relationship systems.

### Dependencies

M3 for Passenger Car state, M7 for shared modifiers, and M8 for recruitment. M13 later provides the final presentation layout.

### Acceptance criteria

- All four survivor archetypes can be rescued and appear in the run roster.
- Each archetype produces a measurable, tested passive effect.
- Survivor benefits interact with repair, station cost, player recovery, and train defense as documented.
- Passenger Car damage has a clear gameplay consequence for survivor benefits.
- Survivor data resets on Retry and does not become persistent meta progression.

### Test checklist

- [ ] Recruit each archetype once and verify roster/count.
- [ ] Verify Montir repair modifier numerically.
- [ ] Verify Pedagang discount never produces a negative cost.
- [ ] Verify Perawat recovery trigger, rate, cap, and interruption behavior.
- [ ] Verify Penjaga defense modifier against train damage/Defense Car output.
- [ ] Verify Passenger Car damage penalty and restoration behavior.
- [ ] Verify survivor presentation is visible without blocking the station flow.
- [ ] Verify no duplicate/invalid survivor is added.

## M10 — Difficulty progression and route structure

### Objective

Turn the prototype arena into the defined journey through three visually and numerically distinct biomes with exactly two station stops and a controlled difficulty ramp.

### Tasks

- [ ] M10.1 Define typed route phases and target durations: departure/onboarding about 1 minute, each biome about 3 minutes, each station about 30 seconds, boss about 2 minutes, with balancing ranges rather than hard timers.
- [ ] M10.2 Define Biome 1 Farmland, Biome 2 Plantation & Forest, and Biome 3 Highland Night as data entries. V1 biome differences come from environment, enemy composition, spawn pressure, and palette; no unique biome mechanic is required.
- [ ] M10.3 Add progress tracking independent of visual scroll distance. Expose a journey percentage and route marker state.
- [ ] M10.4 Add station markers only after Biome 1 and Biome 2; do not accidentally create additional stops.
- [ ] M10.5 Define early, mid, late, and boss-preparation encounter profiles: low pressure early, fast enemy introduction in mid, heavier Keeper pressure late, and a final boss gate.
- [ ] M10.6 Tune spawn interval, active cap, enemy mix, enemy stats, and reward rate through data/configuration rather than scene-specific constants.
- [ ] M10.7 Add a reversible difficulty test mode or debug time scale for balance sessions; keep it out of the player-facing V1 UI.
- [ ] M10.8 Ensure station and boss triggers are idempotent and cannot fire twice due to frame timing or a skipped progress value.

### Dependencies

M5, M6, M8, and M9. M11 consumes the final boss gate.

### Acceptance criteria

- A run progresses in the exact order: Departure → Biome 1 → Station 1 → Biome 2 → Station 2 → Biome 3 → Boss → Destination.
- The journey indicator communicates progress toward a destination without requiring a mini-map.
- Enemy pressure and composition increase from early to late phases in a noticeable but survivable way.
- Both stations occur once per run and are safe zones.
- A normal run can be tuned toward the 10–15 minute target without code changes.
- Route progression cannot skip or repeat a phase because of large frame deltas or duplicate events.

### Test checklist

- [ ] Run the route with a deterministic seed and verify phase order.
- [ ] Verify exact station count and one-time station entry/exit.
- [ ] Verify no enemy attacks during both stations.
- [ ] Verify early/mid/late enemy composition and pressure.
- [ ] Verify progress is monotonic and reaches the boss gate once.
- [ ] Test with large simulated frame deltas around each transition.
- [ ] Record section durations and total run duration for balancing.
- [ ] Verify environment layer/biome switches do not reset player, train, Scrap, or upgrades.

## M11 — Boss encounter

### Objective

Deliver one readable final encounter that tests the player’s run choices without requiring a cinematic system.

### Tasks

- [ ] M11.1 Define Raksasa Alas with high HP, contact/basic attack, area attack, attack cooldowns, movement speed, and reward/result data.
- [ ] M11.2 Implement a brief 1–2 second boss introduction: environment/audio hooks, train-light flicker hook, boss name, then gameplay.
- [ ] M11.3 Implement behavior state 1 as deliberate pursuit/pressure around the train.
- [ ] M11.4 Implement behavior state 2 as a readable enrage or damaged state with changed timing/positioning and an area attack.
- [ ] M11.5 Add a short telegraph before the area attack; show the danger area with shape/contrast, not color alone, and allow a reasonable response window.
- [ ] M11.6 Stop regular spawn composition when the boss begins unless a balance test explicitly proves a small supporting pressure is necessary. Keep V1 readable.
- [ ] M11.7 On boss defeat, clear active boss attacks and unlock the destination/victory transition exactly once.

### Dependencies

M4, M5, M10, and M12’s result-state hooks.

### Acceptance criteria

- The boss appears only after the three-biome route and can be defeated.
- The boss has at least two distinguishable behavior states and a functional area attack.
- Area attack telegraphing is readable and does not depend only on red/green color differences.
- Boss intro is brief and does not trap the player in a cinematic.
- Defeating the boss ends boss behavior and enables the destination/victory flow.

### Test checklist

- [ ] Verify boss spawns once at the correct route point.
- [ ] Verify intro duration and skip/continue behavior.
- [ ] Verify each boss state transition at its configured threshold.
- [ ] Verify basic attack and area attack cooldowns.
- [ ] Verify telegraph timing, area bounds, damage, and player escape.
- [ ] Verify boss attacks stop on pause, death, and victory.
- [ ] Verify boss cannot be duplicated by repeated progress events.
- [ ] Verify boss defeat produces one victory-eligible event.

## M12 — Victory and Game Over flow

### Objective

Close every run cleanly, communicate why it ended, and support Retry without refreshing the browser.

### Tasks

- [ ] M12.1 Define terminal transition ownership and precedence for Player HP = 0, Locomotive HP = 0, boss defeat, and destination reached.
- [ ] M12.2 Implement Game Over when Player HP or Locomotive HP reaches zero. Stop gameplay simulation and prevent duplicate result transitions.
- [ ] M12.3 Implement Victory only after all three biomes are crossed, the boss is defeated, the train remains operational, and destination progress completes.
- [ ] M12.4 Collect run statistics: distance/progress, enemies defeated, Scrap collected, survivors rescued, run duration, and train condition.
- [ ] M12.5 Implement result screens with `Retry` and `Main Menu` actions. Retry constructs a fresh `RunState` without a browser refresh.
- [ ] M12.6 Add restrained placeholder transitions: train slows/power cuts for Game Over; a pause for breath and gradual dawn-color placeholder for Victory.
- [ ] M12.7 Ensure result screens expose enough information to diagnose balance failures during development.

### Dependencies

M3, M5, M6, M9, M10, and M11.

### Acceptance criteria

- Player death and locomotive failure both produce Game Over with the correct result data.
- A successful run reaches Victory only after the defined boss and destination conditions.
- Results show the required run statistics and offer Retry/Main Menu.
- Retry starts a clean run without stale enemies, pickups, upgrades, survivors, timers, or audio.
- Returning to the menu does not preserve run-local progression.

### Test checklist

- [ ] Force Player HP to zero and verify Game Over.
- [ ] Force Locomotive HP to zero and verify Game Over.
- [ ] Force both failures in the same update and verify deterministic terminal-state precedence and result data.
- [ ] Defeat boss before/after a train-critical condition and verify only valid Victory.
- [ ] Verify result statistics against known deterministic events.
- [ ] Retry at least five times without refresh and inspect entity/timer cleanup.
- [ ] Return to menu and begin another run with default state.
- [ ] Verify terminal states cannot receive damage, input, or progress updates.

## M13 — UI and HUD

### Objective

Make the functional interface communicate the current situation quickly without covering the train combat space or becoming a decorative dashboard.

### Tasks

- [ ] M13.1 Implement the HUD for Player HP, Locomotive/Train HP, journey progress, Scrap, survivor count, and current weapon/upgrade information.
- [ ] M13.2 Implement the compact journey indicator with start, two stations, and home/destination markers. Do not add a mini-map.
- [ ] M13.3 Implement Main Menu with Play, Settings, and Credits placeholders; keep the title treatment simple and the background motion restrained.
- [ ] M13.4 Implement contextual onboarding in the gameplay HUD rather than a large tutorial modal.
- [ ] M13.5 Implement the Upgrade Selection screen: gameplay paused/dimmed, three horizontal desktop choices, short descriptions, and keyboard/mouse activation.
- [ ] M13.6 Implement the Station panel over the visible world: station name, Scrap, repair, upgrade, rescue, and Depart actions.
- [ ] M13.7 Implement Pause, Game Over, and Victory result panels with clear primary actions.
- [ ] M13.8 Keep UI surfaces dark/flat with restrained borders, compact indicators, utilitarian typography, and no emoji production icons.
- [ ] M13.9 Add readable non-color cues for important states, configurable screen shake, and session-local audio volume controls.
- [ ] M13.10 Verify layout at 1920×1080 and 1280×720. Show the desktop-recommended notice below the minimum instead of forcing a mobile layout.

### Dependencies

M2, M7, M8, M9, and M12. M13 can use placeholder art and audio.

### Acceptance criteria

- A new player can identify player HP, locomotive HP, progress, Scrap, and survivors at a glance.
- HUD and overlays do not obscure the train or the main combat space.
- Upgrade, Station, Pause, Game Over, and Victory flows expose the correct actions and pause/resume behavior.
- UI remains readable at 1280×720 and does not rely on color alone for critical state.
- Main menu and overlays do not look like a glossy SaaS dashboard, neon HUD, or fantasy card system.

### Test checklist

- [ ] Verify every HUD value updates from state, not duplicated local counters.
- [ ] Verify upgrade selection pauses and resumes correctly.
- [ ] Verify station actions show costs and disabled states.
- [ ] Verify pause blocks gameplay and exposes resume/menu actions.
- [ ] Verify result screens show all required statistics.
- [ ] Verify keyboard and mouse activation for primary actions.
- [ ] Verify no overlap/clipping at both supported resolutions.
- [ ] Verify important warnings use text/icon/shape plus color.
- [ ] Verify screen-shake reduction control changes behavior.
- [ ] Verify no production emoji or placeholder debug labels remain in intended UI.

## M14 — Gameplay balancing and game feel

### Objective

Make the complete placeholder run understandable, tense, responsive, and finishable. This milestone is the gate before final art work begins.

### Tasks

- [ ] M14.1 Play complete deterministic and random runs from menu to Victory and from menu to Game Over; record duration, damage sources, Scrap income/spend, upgrade choices, and survivor effects.
- [ ] M14.2 Tune route timing toward the 10–15 minute target: approximately 1 minute onboarding, 3 minutes per biome, 30 seconds per station, and 2 minutes for the boss, with reasonable variance.
- [ ] M14.3 Tune player movement, projectile speed, fire rate, damage, range, enemy speed/HP/damage, spawn interval, active cap, and attack cooldowns together rather than in isolation.
- [ ] M14.4 Confirm the train matters: enemies can damage multiple sections, Locomotive failure is a credible risk, and the player must choose between protecting the train and surviving personally.
- [ ] M14.5 Tune Scrap drops, repair costs, upgrade availability, station prices, and survivor bonuses so the economy creates decisions without dead ends.
- [ ] M14.6 Ensure every upgrade offer contains at least one useful choice and no upgrade is mandatory for the boss.
- [ ] M14.7 Add game-feel feedback with placeholders: responsive player movement, short hit pause if useful, hit flash, muzzle/impact effects, train damage state, pickup bounce, and very short transitions.
- [ ] M14.8 Tune camera shake and effect density for readability. Confirm disabling/reducing shake remains playable.
- [ ] M14.9 Profile a worst-case combat scene and reduce allocations, particle counts, and active objects until the target is stable on a modern desktop laptop.
- [ ] M14.10 Run a design validation pass: journey reads as a journey, player knows what to protect, enemy roles are clear, and the screen is not visually noisy.

### Dependencies

M1–M13. Do not begin final asset generation or final asset integration before this milestone passes its gate.

### Acceptance criteria

- A first-time player can understand “I am on a moving train; something is attacking it; I must defend it” within a few seconds of play.
- A full run is finishable and normally trends toward 10–15 minutes.
- Game Over is possible but not caused primarily by unreadable feedback, unfair spawns, or unavoidable damage.
- The train, player, enemy types, projectiles, Scrap, HP, and progress remain readable with placeholders.
- Upgrades, stations, survivors, and difficulty progression create meaningful choices.
- The prototype runs without known game-breaking bugs and remains responsive under expected enemy/projectile load.

### Test checklist

- [ ] First-time onboarding test with a player unfamiliar with the implementation.
- [ ] Full Victory run from a clean session.
- [ ] Full Game Over run by Player death.
- [ ] Full Game Over run by Locomotive failure.
- [ ] Retry without refresh after both result types.
- [ ] Economy audit using a spreadsheet/log of Scrap earned and spent.
- [ ] Upgrade usefulness audit across several seeds.
- [ ] Boss readability and survivability test.
- [ ] 1280×720 and 1920×1080 playtests.
- [ ] Performance profile in a late-biome worst-case scene.
- [ ] Prototype gate sign-off recorded before M15 begins.

### Playable prototype gate

M14 is complete only when the PRD prototype criteria are demonstrably true: the game opens locally; movement, aim, attack, spawning, enemy targeting, damage, train HP, Scrap, upgrades, at least one station, survivor bonus, difficulty progression, boss appearance, Victory, Game Over, and refresh-free Retry all work together in one run.

## M15 — Art asset integration

### Objective

Replace approved prototype visuals with a coherent modern pixel-art presentation while preserving every validated gameplay behavior and readability guarantee.

### Tasks

- [ ] M15.1 Freeze the prototype gameplay interfaces and create an asset inventory mapped to the exact render slots: player states, three enemy archetypes, boss states, four train sections, Scrap, projectile, effects, stations, biome layers, props, and UI wordmark/icons where needed.
- [ ] M15.2 Write an asset specification for each family before generation: function, 3/4 top-down view, scale, lighting, material, detail level, transparency, and constraints.
- [ ] M15.3 Generate/prepare small batches, beginning with a master player, a train/carriage visual language, and enemy family references. Do not independently generate unrelated animation frames.
- [ ] M15.4 Pixel-clean, crop, scale, and transparency-clean every candidate. Reject anti-aliased, painterly, blurry, noisy, inconsistent, or perspective-mismatched assets.
- [ ] M15.5 Integrate the train as one coherent set: sturdy/aged regional diesel character, warm passenger windows, readable workshop, improvised defense platform, and visible condition states.
- [ ] M15.6 Integrate player, survivors, enemies, and boss with consistent pixel density, perspective, lighting, silhouette, and animation weight. Keep enemies mysterious and original rather than literal folklore copies.
- [ ] M15.7 Build biome environments from reusable modular assets and layers, not a single giant gameplay background: Farmland, Plantation & Forest, and Highland Night.
- [ ] M15.8 Add fictional station architecture/signage and local context through vegetation, practical structures, props, and railway details. Add station text programmatically/manual; never rely on generated fake text.
- [ ] M15.9 Apply the warm train/cool world contrast, restrained fog/mist, limited rain only if it preserves readability, and sparse foreground occlusion.
- [ ] M15.10 Replace placeholder icons with one consistent functional icon style. Keep the UI industrial/railway utility, flat, restrained, and readable.
- [ ] M15.11 Integrate final assets incrementally with placeholder fallbacks so one bad asset cannot block the game or corrupt unrelated gameplay.

### Dependencies

M14 prototype gate. `art-direction.md — Lintas Malam.md` must be consulted for each asset batch.

### Acceptance criteria

- Primary gameplay assets are replaced by approved local assets without changing gameplay coordinates or balance.
- The train is the visual anchor; the world is cool/dark while train practical lights are warm/brighter.
- The three biomes are distinguishable from environment context and palette without over-decoration.
- Player, enemy archetypes, projectiles, Scrap, and danger areas remain readable in normal combat, thumbnail, and grayscale views.
- No asset contains fake/unreadable generated text, copyrighted game art, neon effects without a source, or inconsistent pixel density.
- Asset filenames are descriptive and organized by the recommended folder structure.

### Test checklist

- [ ] Asset family consistency review: perspective, scale, lighting, palette, outlines, transparency, shadows.
- [ ] Screenshot test with UI hidden: warm train, tropical night journey, and danger are immediately readable.
- [ ] Thumbnail test: train, player, and enemy roles remain distinguishable at small scale.
- [ ] Grayscale test: silhouettes and interaction states remain distinct without hue alone.
- [ ] Combat test in all three biomes with fog/rain/effects enabled as applicable.
- [ ] Station signage and train markings use programmatic/manual text only.
- [ ] Verify foreground elements never hide player, enemy, projectile, Scrap, or danger telegraph.
- [ ] Verify asset loading has fallbacks and no missing-texture console errors.
- [ ] Re-run performance profile after final textures and effects are loaded.

## M16 — Audio and polish

### Objective

Add the minimum V1 audio identity and restrained transitions/effects that reinforce the journey without sacrificing clarity or asset consistency.

### Tasks

- [ ] M16.1 Add a local audio catalog and manager for train movement ambience, weapon, enemy hit/death, train damage, Scrap pickup, upgrade selection, station ambience, and boss cue.
- [ ] M16.2 Use only original, generated, or properly licensed audio. Record the source/license for each shipped audio file.
- [ ] M16.3 Implement session-local master, music, and effects volume controls and ensure mute behavior is complete.
- [ ] M16.4 Add station arrival/departure audio and a clear but restrained boss introduction cue.
- [ ] M16.5 Polish train smoke, sparks, dust, impact, muzzle flash, small debris, and short explosions using low-resolution, pixel-grid-consistent effects.
- [ ] M16.6 Add visual state polish for train damage: stable lights when healthy, occasional sparks/smoke when damaged, stronger smoke/flicker when critical.
- [ ] M16.7 Implement 100–250 ms UI transitions where helpful, a brief Game Over power-down, a brief Victory breathing space, and an understated gradual dawn transition.
- [ ] M16.8 Confirm weather remains optional and subordinate: light mist/occasional rain only; no gameplay-blocking fog, giant rain streaks, constant lightning, bloom, or screen-filling explosions.

### Dependencies

M15 for asset and presentation slots, M13 for controls, and M14 for the validated timing/readability budget.

### Acceptance criteria

- All minimum V1 audio feedback categories are present or have an explicit approved substitute.
- Volume controls work, mute is reliable, and audio does not restart or leak across Retry/menu transitions.
- Effects communicate hits, damage, and state changes without obscuring combat.
- Victory and Game Over transitions have the intended emotional contrast while remaining brief.
- Polish does not introduce new mechanics, new enemies, or new progression systems.

### Test checklist

- [ ] Verify each sound trigger once and at an appropriate volume.
- [ ] Verify looping train ambience starts/stops across gameplay, station, pause, results, and Retry.
- [ ] Verify mute and volume controls for music/effects/master.
- [ ] Verify no audio exceptions with missing optional files.
- [ ] Verify particles/effects are capped and cleaned up.
- [ ] Verify camera shake can be reduced/disabled.
- [ ] Verify fog/rain/lighting preserve enemy and projectile readability.
- [ ] Verify Victory dawn and Game Over power-down transitions complete without trapping the flow.

## M17 — Final V1 QA

### Objective

Prove that the complete local build satisfies the V1 product, design, art, accessibility, and performance requirements without scope creep.

### Tasks

- [ ] M17.1 Run a clean install, typecheck, lint, production build, preview, and browser smoke test from a clean checkout/build directory. Treat the production `dist/` directory as the only runtime artifact for shared hosting.
- [ ] M17.2 Complete at least one full run to Victory and one run to each Game Over cause at both 1920×1080 and 1280×720.
- [ ] M17.3 Repeat Retry/Main Menu transitions multiple times and inspect for stale entities, timers, event listeners, audio, memory growth, and duplicated UI.
- [ ] M17.4 Verify all three biomes, both stations, all four train sections, all four survivor archetypes, all three regular enemies, and the two-state boss are reachable and functional.
- [ ] M17.5 Verify UI readability, pause behavior, screen-shake control, audio controls, color-independent cues, and below-minimum-resolution notice.
- [ ] M17.6 Verify 60 FPS target on a modern desktop laptop in a late-biome worst-case scene; capture a profiler result and investigate sustained frame drops.
- [ ] M17.7 Run screenshot, thumbnail, grayscale, and art-direction reviews. Remove decorative clutter and any generic AI-style visual treatment.
- [ ] M17.8 Search the code and assets for out-of-scope features, external runtime dependencies, copyrighted assets, fake generated text, and accidental persistence.
- [ ] M17.9 Track and fix all release-blocking bugs. Document any non-blocking known issue explicitly before release.
- [ ] M17.10 Deploy the production `dist/` contents to a PHP shared-hosting staging folder or domain using cPanel/FTP, then verify the game from the deployed URL.
- [ ] M17.11 Verify root and subfolder deployment paths, HTTPS behavior, cache-safe asset loading, browser refresh, audio after the Play gesture, and refresh-free Retry.

### Dependencies

M1–M16.

### Acceptance criteria

- The PRD V1 acceptance criteria are all demonstrably satisfied.
- The full run can be completed in approximately 10–15 minutes and follows the required route.
- There are no known game-breaking bugs in core movement, combat, train failure, economy, upgrades, stations, survivors, boss, result flow, or Retry.
- The build is local-first, stable in supported desktop browsers, readable at the minimum resolution, and within the V1 content budget.
- The generated static build runs on the available PHP shared hosting without Node.js, PHP application code, a database, writable server storage, or a runtime API.
- The final screenshot communicates: a warm night train crossing a dark tropical landscape while the player defends it from surrounding creatures.

### Test checklist

- [ ] Clean-build smoke test.
- [ ] Full route Victory playthrough.
- [ ] Player-death Game Over playthrough.
- [ ] Locomotive-death Game Over playthrough.
- [ ] Retry/Main Menu loop test.
- [ ] Station repair, purchase, rescue, and Depart test at both stations.
- [ ] All six upgrade definitions and max-level behavior test.
- [ ] Four survivor passive tests in an integrated run.
- [ ] Three enemy archetype and boss state tests.
- [ ] Pause/resume and input-blocking test for every non-Playing state.
- [ ] 1280×720 and 1920×1080 layout/readability test.
- [ ] Accessibility and color-independent cue test.
- [ ] Performance and memory cleanup test.
- [ ] Upload only the production `dist/` contents to PHP shared hosting and verify the deployed URL.
- [ ] Verify root-path and subfolder-path asset resolution, including any required `.htaccess` behavior.
- [ ] Verify hard refresh, browser cache reload, audio after Play, and Retry on the deployed build.
- [ ] Art screenshot, thumbnail, grayscale, and fake-text audit.
- [ ] Out-of-scope and no-backend audit.

# Definition of done

## Playable prototype

The playable prototype is done at the end of M14 when:

- The game opens locally in a desktop browser and can be restarted without refresh.
- WASD movement, mouse aim, Left Click attack, and Esc pause work.
- The train is a four-section objective with independent HP and locomotive failure.
- All three regular enemies spawn, target, attack, take damage, die, and drop Scrap.
- Scrap can be collected and spent in run-local systems.
- Upgrade offers present 1 of 3 choices and apply meaningful player/train/defense changes.
- At least one station is fully functional; the reusable flow is ready for the second station.
- All four survivor bonuses are implemented and testable, even with placeholder presentation.
- Difficulty increases along the journey and the three-biome route is represented by data/progression.
- The final boss can appear, change behavior, use an area attack, and be defeated.
- Victory, both Game Over causes, result statistics, Retry, and Main Menu work without refresh.
- Placeholder visuals communicate train, player, enemy, projectile, Scrap, HP, danger, and travel direction.
- Important unit, integration, smoke, and playtest checks pass.

## V1

V1 is done at the end of M17 when the prototype definition remains true and, in addition:

- Three playable biomes, two safe station stops, four functioning train sections, four survivor archetypes, and one two-state final boss are integrated.
- Primary gameplay visuals are approved modern pixel art with consistent perspective, pixel density, palette, lighting, silhouette, and animation language.
- The warm train/cool tropical night identity is immediately visible, and local context is communicated through environment and practical details rather than stereotypes or decorative overload.
- Basic audio feedback, train ambience, station ambience, boss cue, UI sounds, damage feedback, restrained effects, and result transitions are present.
- HUD and screens are polished, readable, responsive from 1920×1080 to 1280×720, and support pause, screen-shake reduction, and volume controls.
- A full run is finishable in approximately 10–15 minutes with no known game-breaking bug.
- Performance is suitable for 60 FPS on a modern desktop laptop under expected V1 load.
- No backend, authentication, multiplayer, leaderboard, cloud save, or persistent meta progression exists.

# Explicitly out of scope

Do not implement any of the following during prototype or V1 unless the scope is explicitly revised:

- Backend services, authentication, accounts, multiplayer, online sessions, leaderboard, cloud save, analytics service, or runtime API dependency.
- Persistent meta progression, cross-run Scrap, unlock trees, achievements, daily systems, or account inventory.
- Mobile optimization, portrait layout, touch controls, controller support, or a mobile-specific HUD.
- Multiple playable characters, character classes, multiple train routes, route selection, endless mode, or additional train-car types.
- More than the defined three biomes, two stations, three regular enemies, four survivor archetypes, and one final boss as V1 content expansion.
- Complex procedural world generation, open-world exploration, dynamic track simulation, physics-heavy train operation, or biome-specific mechanics.
- Complex crafting, inventory management, item rarity, weapon inventory, weapon swapping, turret customization, or skill-tree systems.
- Dialogue trees, relationship systems, branching narrative, lore codex, or long cinematics.
- Microtransactions, monetization, ads, social features, or external account linking.
- Final art generation before the M14 prototype gate, or use of copyrighted assets from other games.
- Giant generated gameplay backgrounds that prevent modular parallax, responsive scaling, or controlled performance.
- Decorative cultural symbols used without context, direct folklore character copies, generated fake text/signage, neon/fantasy weapon effects, or visual polish that reduces readability.
- Weather as a required gameplay mechanic. Light mist/rain is optional atmosphere only and must not block combat.

# Risk areas and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Train-relative coordinates vs. scrolling world | Incorrect coordinate conversion can break aiming, collisions, and the sense of travel. | Decide the coordinate model in M1/M2; keep conversion functions centralized; test at both viewports and after resize. |
| Train becomes a background prop | The game loses its core identity and strategic tension. | Give every section HP, condition feedback, targetable hitboxes, and distinct repair/defense consequences before adding polish. |
| Enemy targeting feels random or unfair | The player cannot make meaningful positioning decisions. | Use explicit target priorities, cooldown-based retargeting, safe spawn rules, telegraphs, and deterministic tests. |
| 10–15 minute run drifts or becomes exhausting | The route can feel like an arena or fail to build tension. | Make phase timing and encounter composition data-driven; log durations and tune full runs in M14. |
| Economy creates dead ends | A player can become unable to repair or respond to future threats. | Test income/spend across seeds; guarantee useful choices; keep costs and discounts bounded; avoid mandatory upgrade paths. |
| State transitions duplicate or leak | Station/boss/result flows may trigger twice or leave timers/entities alive. | Centralize transitions, make events idempotent, stop systems by state, and repeat Retry tests in M12/M17. |
| Boss is unreadable in a dark scene | The climax becomes frustrating rather than tense. | Use silhouette, motion, telegraphed area shapes, contrast, and grayscale tests; limit fog and effects around the boss. |
| Generated assets are visually inconsistent | The final game can look like unrelated AI outputs. | Generate by asset family, establish masters first, pixel-clean/reject candidates, and use the art approval checklist in M15. |
| Generated text or cultural imagery is unsafe/unusable | Signs may be illegible or local identity may become stereotypical. | Keep signs/text programmatic/manual; use context-driven local props; avoid direct folklore copies and decorative sacred imagery. |
| Effects and entities hurt 60 FPS | Browser rendering can degrade when the run peaks. | Cap enemies/effects, reuse sprites, pool projectiles if needed, profile before and after art/audio integration. |
| UI obscures combat or depends on color | Important decisions become hard to read at the minimum viewport or for color-blind players. | Keep HUD compact, use text/shape cues, test 1280×720 and grayscale, and retain configurable shake. |
| Scope creep during polish | Extra content can prevent a coherent V1 from shipping. | Treat the content budget and explicit out-of-scope list as release gates; prefer better game feel, readability, and identity over more features. |

# Scope-change rule

Any proposed feature should be rejected or deferred if it adds a new persistence model, backend dependency, player progression layer, route, playable character, biome mechanic, enemy family, or complex UI flow. If a requirement is unclear, implement the smallest data-driven version that preserves the core loop:

`Travel → Fight → Collect → Upgrade → Station → Travel`

and record the decision in the relevant milestone before proceeding.
