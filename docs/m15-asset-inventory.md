# M15 Asset Inventory & Batch Specifications

Status: M15 in progress. Batch 1 player art and Batch 2 train section art are integrated behind placeholder fallbacks. The enemy family remains reference-only pending per-archetype runtime assets. This document is the approval record for each art batch and the mapping between generated assets and existing prototype render slots.

## Shared art contract

- Camera: consistent 3/4 top-down gameplay view; no side-view assets.
- Target density: player approximately 32×48 virtual pixels; regular enemies approximately 32×32–48×64; Keeper approximately 64×80; train sections approximately 160–240 virtual pixels long.
- Style: modern pixel art, hard pixel edges, deliberate clusters, restrained outlines, limited shading, no painterly gradients, no blur.
- Lighting: cool moonlit world with localized warm practical train/station light.
- Regional identity: grounded fictional Southeast Asian rural railway context through practical workwear, vegetation, infrastructure, materials, and lighting; no costume shorthand or caricature.
- Runtime rule: every asset is optional at load time. A missing or rejected candidate must leave the existing placeholder render and gameplay coordinates intact.
- Text rule: generated images contain no text, logos, station names, or markings that could become fake/unreadable text. All readable text remains programmatic/manual.

## Render-slot inventory

| Family | Current prototype slot | Planned asset(s) | Size / view | First-batch status |
| --- | --- | --- | --- | --- |
| Player | `GameplayScene.createPlayerAndAim()` marker | `characters/player/player_idle.png` | 32×48 virtual px, transparent, 3/4 top-down | Integrated in Batch 1 |
| Player states | `updatePlayerAndAim()` position/visibility | `player_walk.png`, `player_hit.png` later derived from the approved master | Same master proportions and lighting | Deferred until master is approved |
| Mist | `createEnemyView()` circle | `enemies/mist/mist_master.png` then walk/hit/death | 40×48 virtual px, transparent, low posture | Reference only in first batch |
| Shadow | `createEnemyView()` diamond | `enemies/shadow/shadow_master.png` then walk/hit/death | 36×64 virtual px, transparent, elongated silhouette | Reference only in first batch |
| Keeper / boss | Keeper rectangle and boss shape | `enemies/keeper/keeper_master.png`, `boss/boss_idle.png`, `boss/boss_hit.png` | Keeper 64×80; boss 96×112 virtual px | Reference only in first batch |
| Train | `drawPlaceholderWorld()` four `TRAIN_SECTION_LAYOUT` bodies | `train/locomotive.png`, `carriage_passenger.png`, `carriage_workshop.png`, `carriage_defense.png` | 160–240×64–96 virtual px each, transparent | Integrated in Batch 2 |
| Train states | `updateTrainViews()` condition and HP overlays | condition-driven alpha pulse/fade over base art | Same section bounds; no gameplay hitbox changes | Integrated in Batch 2; damage FX remains code-native |
| Projectile | `createProjectileView()` circle | `fx/projectile_player.png` | 8–12 virtual px, transparent | Keep code-native until icon readability pass |
| Scrap | `createScrapView()` shape | `pickups/scrap.png` | 16–24 virtual px, transparent | Deferred; code shape remains fallback |
| Effects | muzzle/hit/player/train feedback methods | `fx/muzzle.png`, `hit.png`, `train_sparks.png`, `mist_puff.png` | Small modular pixel clusters | Deferred to M15.9/M16 |
| Biome layers | `drawPlaceholderWorld()` rectangles/parallax layers | `environment/biome_farmland/*`, `biome_forest/*`, `biome_highland/*` | Modular tiles/props, not one giant image | Deferred until train/player anchors pass |
| Station | station overlay plus world layer | `environment/stations/regional_stop.png`, modular lamp/roof/bench/rail props | 3/4 top-down, transparent modules | Deferred to M15.8 |
| Survivors | `createSurvivorRoster()` colored marker/portrait placeholder | four role-specific simple masters | 24–32×40 virtual px, transparent | Deferred until player master pass |
| UI | text and code-drawn HUD | code-native functional icons; manual wordmark if approved | Crisp UI pixels; no generated text | No image generation in first batch |

## Batch 1 specifications

### A. Player master — `characters/player/player_idle.png`

- Function: primary controlled character; first real gameplay asset and style anchor for other human characters.
- Subject: ordinary night-train defender with work jacket, practical trousers and boots, small utility bag/belt, and a compact firearm held safely in a low ready pose.
- View: 3/4 top-down, facing slightly toward the camera/right so the silhouette works beside the train and aim line.
- Scale: source may be larger, but must be cropped and reduced to approximately 32×48 virtual pixels with nearest-neighbor scaling.
- Lighting: cool ambient moonlight; a small restrained warm rim or practical highlight from the train, not a glow effect.
- Materials: worn workwear fabric, matte boots, simple metal firearm; human-scale and non-militaristic.
- Background: genuine transparency with a clean alpha edge; no floor, circular halo, or baked shadow.
- Constraints: original design; no text, logo, watermark, armor, superhero pose, fantasy weapon, neon, anime styling, painterly rendering, smooth gradients, or folkloric costume.
- Approval gate: recognizable at 32×48, readable in grayscale, and visually compatible with the placeholder train palette before any derived animation is made.

### B. Train visual-language anchor — `docs/m15-generated/train_visual_language_reference.png`

- Function: reference sheet for the later locomotive/passenger/workshop/defense set; not a runtime sprite until section assets are separately approved.
- Subject: one sturdy aged regional diesel train set shown in the same 3/4 top-down camera: locomotive plus passenger, workshop, and improvised defense sections.
- View: a consistent train-facing direction and aligned carriage proportions, with visible couplers and a readable strong front silhouette.
- Scale: reference composition may be larger, but each section must imply approximately 160–240 virtual pixels in the gameplay layout.
- Lighting: cool exterior metal with warm passenger windows and restrained workshop/defense practical lights.
- Materials: aged painted metal, practical railway hardware, limited wear, not military armor or futuristic technology.
- Background: transparent if possible; no landscape, no station text, no logos, no fake markings.
- Constraints: all four sections must look like one operator/train set; no luxury train, cyberpunk, armored train, excessive rust, neon, or decorative fantasy details.
- Approval gate: train remains the focal point at thumbnail scale and the four roles are distinguishable by silhouette/detail rather than text.

### C. Enemy family reference — `docs/m15-generated/enemy_family_reference.png`

- Function: shared design anchor for Mist, Shadow, Keeper, and the later boss treatment; reference only until each silhouette is separated and tested in gameplay.
- Subjects: three original mysterious creatures in one consistent pixel-art family: low mist-trailing form, tall elongated shadow form, and heavy asymmetrical bark/root-influenced Keeper form.
- View: consistent 3/4 top-down gameplay view, neutral poses, separated silhouettes.
- Scale: imply approximately 40×48, 36×64, and 64×80 virtual pixels respectively.
- Lighting: the same cool moonlight direction as the player; subtle material highlights only.
- Materials: ambiguous organic/atmospheric forms with muted palette and clustered pixels; not explicit gore.
- Background: transparent if possible; no text, labels, logos, or environmental scenery.
- Constraints: mysterious and original; no direct pocong/sheet ghost, generic zombie, black humanoid with red eyes, anime demon, fantasy golem, neon aura, or painterly horror concept art.
- Approval gate: each archetype has a different silhouette and remains distinct from the player in grayscale and at thumbnail scale.

## Batch 2 specifications — train runtime set

All four assets below use the same operator identity and were derived from the Batch 1 train reference. They share a right-facing gameplay orientation so the existing runtime order `[Defense]—[Workshop]—[Passenger]—[Locomotive]` remains coherent without changing coordinates.

### D1. Locomotive — `public/assets/train/locomotive.png`

- Function: locomotive gameplay section and train focal point.
- View: horizontal 3/4 top-down, front/coupler pointing right.
- Scale: 256×128 transparent runtime canvas; content reduced with nearest-neighbor to 240×92.
- Lighting/material: cool navy/teal painted metal, restrained ochre stripe, small warm lamps, aged but maintained regional diesel hardware.
- Constraints: strong front silhouette, both couplers and wheels retained, no text, logo, fake markings, neon, futuristic detail, or military armor.

### D2. Passenger carriage — `public/assets/train/carriage_passenger.png`

- Function: passenger shelter/life section and warm-vs-cool contrast anchor.
- View: horizontal 3/4 top-down, right-facing set, couplers on both ends.
- Scale: 256×128 transparent runtime canvas; content reduced with nearest-neighbor to 240×72.
- Lighting/material: cool blue-teal body, aged ochre stripe, small warm amber windows, modest interior silhouettes, simple vents and undercarriage.
- Constraints: ordinary regional passenger car, not luxury; no text, logo, fake markings, giant glow, neon, or painterly gradient.

### D3. Workshop carriage — `public/assets/train/carriage_workshop.png`

- Function: repair/maintenance gameplay section and station-support visual cue.
- View: horizontal 3/4 top-down, right-facing set, couplers on both ends.
- Scale: 256×128 transparent runtime canvas; content reduced with nearest-neighbor to 240×87.
- Lighting/material: cool painted metal with one restrained warm service lamp, visible workbench/tool silhouettes, practical vents and wheels.
- Constraints: readable workshop detail without a magical lab, no text, logo, fake markings, futuristic technology, or excessive clutter.

### D4. Defense carriage — `public/assets/train/carriage_defense.png`

- Function: defense gameplay section and improvised protection visual cue.
- View: horizontal 3/4 top-down, right-facing set, couplers on both ends.
- Scale: 256×128 transparent runtime canvas; content reduced with nearest-neighbor to 240×84.
- Lighting/material: cool painted metal, muted olive canvas/sandbags, crates, low practical gun platform, one warm lamp, modest wear.
- Constraints: repairable passenger/worker improvisation, not military armor or a turret fortress; no text, logo, fake markings, neon, or giant weaponry.

### Batch 2 review result

- The first four generated outputs contained a baked checkerboard background, so they were rejected as-is and not shipped.
- The selected train candidates were background-cleaned, thresholded to hard alpha, cropped, and reduced with nearest-neighbor into the four runtime canvases.
- Visual inspection confirms the four roles are distinct, share the same cool metal/ochre/amber language, and contain no readable generated text or logos.
- The runtime does not depend on condition-specific generated variants: HP/condition overlays and the critical pulse remain code-controlled, preventing art state drift.

## Generation and approval log

| Asset | Prompt record | Local output | Approval | Runtime use |
| --- | --- | --- | --- | --- |
| Player master | Batch 1 prompt A below | `public/assets/characters/player/player_idle.png` | Runtime-approved for Batch 1 | Integrated with placeholder fallback |
| Train visual language reference | Batch 1 prompt B below | `docs/m15-generated/train_visual_language_reference.png` | Pending family review | Reference only; not loaded by gameplay |
| Enemy family reference | Batch 1 prompt C below | `docs/m15-generated/enemy_family_reference.png` | Pending family review | Reference only; not loaded by gameplay |
| Locomotive | Batch 2 prompt D1 below | `public/assets/train/locomotive.png` | Runtime-approved for M15.5 | Integrated with placeholder fallback |
| Passenger carriage | Batch 2 prompt D2 below | `public/assets/train/carriage_passenger.png` | Runtime-approved for M15.5 | Integrated with placeholder fallback |
| Workshop carriage | Batch 2 prompt D3 below | `public/assets/train/carriage_workshop.png` | Runtime-approved for M15.5 | Integrated with placeholder fallback |
| Defense carriage | Batch 2 prompt D4 below | `public/assets/train/carriage_defense.png` | Runtime-approved for M15.5 | Integrated with placeholder fallback |

## Batch 1 prompt records

The following records preserve the structured prompts used for the generated candidates. The generated images contain no requested text, logos, or station names.

### Batch 1 prompt A — player master

```text
Use case: final-game asset master for Lintas Malam V1, a desktop browser survival game.
Asset type: single original pixel-art game character sprite, not a concept sheet.
Scene/backdrop: genuinely transparent background; no floor, no circular halo, no baked shadow, no scenery.
Subject: an ordinary Southeast Asian night-train defender, human-scale and grounded. 3/4 top-down view, facing slightly toward the camera and right. Worn dark teal work jacket, muted ochre shirt detail, practical dark trousers, simple boots, small utility bag or belt, compact plain firearm held in a low-ready pose. The silhouette should feel like a railway worker who stepped up to protect the train, not a superhero or soldier.
Style/medium: modern pixel art with hard pixel edges, deliberate clustered pixels, restrained outline, limited shading, consistent 32–64 pixel density, clean readable silhouette, no painterly rendering.
Composition/framing: one centered full-body character, generous transparent padding, neutral idle pose, readable hands/weapon/clothing shapes when reduced to approximately 32x48 virtual pixels.
Lighting/mood: cool moonlit ambient light with one restrained warm practical highlight from the nearby train; grounded, atmospheric, slightly worn.
Color palette: deep navy, dark teal, muted olive, warm ochre, small skin-tone accents, restrained warm amber highlight; no neon.
Materials/textures: matte workwear fabric, simple metal firearm, modest pixel clusters, no noisy texture.
Text verbatim: none. No text, logos, signage, watermark, symbols, or letters.
Constraints: original design; Southeast Asian/Indonesian rural railway context communicated through practical workwear and proportions rather than costume; transparent alpha edges; consistent 3/4 top-down camera; no armor, no tactical military operator, no futuristic gear, no fantasy weapon, no folkloric costume, no exaggerated cultural stereotype.
Avoid: anti-aliased edges, blur, smooth gradients, bloom, glow aura, anime styling, chibi proportions, giant weapon, heroic pose, generic AI-game character, extra characters, duplicate limbs, malformed hands, cropped feet, background objects.
```

### Batch 1 prompt B — train visual language reference

```text
Use case: visual-language reference sheet for final assets in Lintas Malam V1, a desktop browser survival game.
Asset type: one original pixel-art train reference composition, not a UI image and not a finished background.
Scene/backdrop: genuinely transparent background; isolate only the train set; no landscape, station, rails, labels, signage, logos, or text.
Subject: a sturdy aged regional diesel night train made of four connected readable sections in one operator set, shown in a consistent 3/4 top-down view and one direction: front locomotive, warm passenger carriage, practical workshop carriage, and improvised defense platform carriage. Strong locomotive front silhouette. Passenger section has small warm amber windows. Workshop has visible tools/utility forms. Defense section has a modest reinforced platform and practical equipment, not military armor.
Style/medium: modern pixel art with hard pixel edges, deliberate clustered pixels, restrained outlines, limited shading, consistent pixel density, grounded game-ready shape language.
Composition/framing: single connected train set centered horizontally with generous transparent padding, clearly separated couplers and section silhouettes, readable at thumbnail scale. Keep the four roles visually distinct through shape and material, not text.
Lighting/mood: cool dark teal/navy exterior metal under moonlight, localized warm amber practical light in passenger windows and small work lamps; slightly worn and atmospheric but not rusty or grimy.
Color palette: deep navy, charcoal blue, muted teal, aged brown/ochre metal, restrained amber windows, tiny muted red safety accents; no neon.
Materials/textures: aged painted metal, simple railway hardware, modest weathering, controlled pixel clusters, no noisy texture.
Text verbatim: none. No text, logos, fake station names, letters, numbers, symbols, watermark, or branding.
Constraints: original design; Southeast Asian rural regional railway practicality communicated by materials and proportions; all sections must look like one train set; keep the visual suitable for later 160–240 virtual pixel section sprites; no futuristic train, luxury train, military armored train, cyberpunk, fantasy ornament, excessive rust, giant weaponry, or decorative clutter.
Avoid: side-view illustration, isometric mismatch, painterly rendering, anti-aliased edges, blur, smooth gradients, bloom, glow aura, extra trains, disconnected random carriages, illegible tiny text, generic AI game concept art.
```

### Batch 1 prompt C — enemy family reference

```text
Use case: enemy family design reference for final assets in Lintas Malam V1, a desktop browser survival game.
Asset type: one original pixel-art enemy reference sheet with exactly three separated creatures, not a UI image and not a finished gameplay background.
Scene/backdrop: genuinely transparent background; no scenery, floor, labels, text, logos, symbols, watermark, or frame.
Subjects: three mysterious original creatures sharing one visual world and one 3/4 top-down camera. Left: Mist, a small low fast form partly dissolving into trailing vapor, with unclear facial detail. Center: Shadow, a tall thin elongated silhouette with distorted posture and minimal facial detail. Right: Keeper, a broad heavy asymmetrical forest-associated form with restrained bark/root material hints and a grounded stance. Make silhouettes immediately different without relying on red coloring or glowing eyes.
View: consistent 3/4 top-down gameplay perspective, all creatures facing slightly toward camera/right, separated with clear negative space.
Scale: imply approximately 40x48 virtual pixels for Mist, 36x64 for Shadow, and 64x80 for Keeper; keep proportions useful for later sprite separation.
Style/medium: modern pixel art, hard pixel edges, deliberate clustered pixels, restrained outlines, limited shading, consistent pixel density, clean readable silhouettes.
Lighting/mood: shared cool moonlight from upper left with subtle muted highlights; eerie but grounded and ambiguous, not gore-heavy horror.
Color palette: deep navy, blue-green, charcoal, muted moss, desaturated violet-gray, tiny restrained ochre highlights; no neon and no bright red eyes.
Materials/textures: ambiguous organic and atmospheric forms, compact pixel clusters, Mist has vapor-like trailing edge, Shadow has clothless abstract silhouette, Keeper has old bark/root-like hints without becoming a fantasy monster.
Text verbatim: none. No text, logos, labels, numbers, letters, or fake markings.
Constraints: original designs; mysterious whether supernatural, biological, or something else; Southeast Asian tropical night setting implied only through palette/material context; no direct pocong/sheet ghost, no generic zombie, no generic black humanoid, no anime demon, no fantasy golem, no skulls, no gore, no armor.
Avoid: painterly concept art, smooth gradients, anti-aliased edges, blur, bloom, glow aura, noisy texture, unrelated styles between the three, duplicate limbs, extra creatures, cropped silhouettes, generic AI-game monster sheet.
```

### Batch 2 prompt records — train runtime set

Each D prompt used the Batch 1 train reference as `Image 1` with the role “visual-language reference only”; the slot-specific subject and constraints below were appended to the shared prompt.

```text
Shared use case: final-game asset for Lintas Malam V1.
Shared asset type: one standalone transparent pixel-art train section for a runtime slot.
Shared input rule: preserve the reference's aged regional diesel material language, cool blue-teal exterior, restrained ochre stripe, undercarriage weight, pixel density, and lighting direction; do not reproduce the whole reference sheet.
Shared camera: horizontal 3/4 top-down, right-facing gameplay train set, transparent background, no rails, landscape, station, other cars, text, logos, numbers, letters, fake markings, watermark, or branding.
Shared style: modern pixel art, hard pixel edges, deliberate clusters, restrained outlines, limited shading, consistent 32–64 pixel density, no painterly rendering, blur, smooth gradients, bloom, neon, or perspective mismatch.
Shared composition: centered single section with both couplers readable, transparent padding, suitable for approximately 250x112 virtual-pixel section slot.
Shared mood/material: cool moonlit exterior, localized warm practical light, sturdy ordinary regional railway, slightly worn but maintained, no luxury/futuristic/military styling, no excessive rust.
```

```text
Batch 2 prompt D1 override — LOCOMOTIVE:
Create the front locomotive section with a strong cab/front silhouette pointing right, practical cab, front lamps, vents, handrails, undercarriage, wheels, and modest aged paint. Keep warm light only in small practical lamps.
```

```text
Batch 2 prompt D2 override — PASSENGER:
Create an ordinary passenger carriage with clear doors, roof vents, undercarriage, wheels, and several small warm amber passenger windows. It should communicate shelter and life, not luxury; windows glow gently without bloom.
```

```text
Batch 2 prompt D3 override — WORKSHOP:
Create a practical railway maintenance/workshop carriage with utility doors, roof vents, wheels, one side service bay or open work window, workbench/tool silhouettes, and one or two restrained warm work lamps. It must read as repair infrastructure, not a magical laboratory.
```

```text
Batch 2 prompt D4 override — DEFENSE:
Create an improvised freight/flatbed defense carriage with low practical platform, reinforced rails, stacked sandbags or maintenance crates, compact mounted utility gun silhouette, canvas, and one small warm work lamp. It must feel repairable by passengers and railway workers, not military armor or a turret fortress.
```

## Batch review checklist

- [ ] Inspect source output for accidental text, logos, watermarks, or unrelated objects.
- [ ] Confirm alpha transparency and remove baked floor/halo/shadow where runtime does not need it.
- [ ] Crop to the subject and reduce with nearest-neighbor scaling; retain the master source outside runtime only when useful for later derivation.
- [ ] Check hard pixel edges, limited palette, silhouette, and consistent light direction.
- [ ] Review normal gameplay, thumbnail, and grayscale readability before approving.
- [ ] Integrate only approved assets; keep placeholder fallback for every unapproved slot.
