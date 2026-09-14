# Lintas Malam
## Art Direction Guide

**Version:** 0.1  
**Related Documents:** `PRD.md`, `design.md`  
**Visual Style:** Modern Pixel Art  
**Primary Mood:** Nocturnal, atmospheric, grounded, warm-vs-cold contrast  
**Platform:** Desktop Web

---

# 1. Art Direction Goal

Lintas Malam harus memiliki visual identity yang langsung terbaca sebagai:

> Sebuah kereta malam yang hangat bergerak melewati lanskap tropis yang gelap dan berbahaya.

Visual harus terasa:

- atmospheric
- grounded
- cohesive
- slightly melancholic
- readable during combat
- locally inspired without becoming stereotypical

Tujuan utama bukan membuat game terlihat "ramai" atau "mahal".

Tujuan utama adalah membuat game terlihat:

**intentional.**

---

# 2. Core Visual Identity

Identitas visual dibangun dari empat elemen utama:

## 2.1 The Warm Train

Kereta adalah pusat visual.

Interior dan lampu kereta menggunakan warna yang lebih hangat.

Kereta harus terasa seperti:

- shelter
- life
- movement
- hope

## 2.2 The Cold World

Dunia di luar kereta lebih:

- gelap
- dingin
- berkabut
- tidak pasti

Environment tidak harus horror.

Tetapi harus memberikan perasaan bahwa player tidak ingin terlalu jauh dari kereta.

## 2.3 Tropical Night

Dunia game harus terasa berada di wilayah tropis.

Gunakan:

- vegetation density
- wet surfaces
- farmland
- mist
- hill silhouettes
- tiled roofs
- railway infrastructure

untuk memberikan identitas tersebut.

## 2.4 Human Scale

Semua visual harus terasa dekat dengan kehidupan manusia biasa.

Hindari desain yang terlalu:

- heroic
- futuristic
- militaristic
- fantasy-heavy

Lintas Malam adalah cerita tentang orang biasa dalam perjalanan yang luar biasa.

---

# 3. Visual Style

Target style:

**Modern Pixel Art**

Bukan:

- 8-bit imitation
- ultra-retro NES style
- fake pixel art dengan blur
- high-resolution painting yang hanya dipixelate

Visual harus menggunakan pixel grid yang konsisten.

Ciri utama:

- clean silhouettes
- deliberate clusters
- limited shading
- controlled detail
- readable animation
- restrained outlines

---

# 4. Pixel Density

Recommended virtual asset scale:

**32–64 px character scale**

Contoh:

Player:

approximately **32×48 px**

Regular enemy:

approximately **32×32 to 48×64 px**

Heavy enemy:

approximately **64×80 px**

Train carriage:

approximately **160–240 px long**

Exact size dapat berubah sesuai camera testing.

Yang penting:

**seluruh asset mengikuti pixel density yang sama.**

Jangan mencampur sprite:

- 16-bit low-detail
- 64 px detailed character
- high-res generated illustration

dalam satu scene.

---

# 5. Rendering Rules

Generated asset harus:

- use hard pixel edges
- avoid anti-aliased edges where possible
- maintain consistent pixel size
- avoid painterly gradients
- avoid overly smooth shadows
- avoid noisy texture

Jika image generation menghasilkan visual terlalu halus:

asset harus:

- regenerate
- simplify
- atau manually pixel-clean

sebelum digunakan.

---

# 6. Color Philosophy

Game menggunakan sistem warna berdasarkan fungsi.

## Environment

Dominant:

- cool blue
- desaturated green
- muted teal
- grey
- dark navy

## Train

Dominant accents:

- warm amber
- muted orange
- warm yellow
- dark brown
- industrial red

## Danger

Gunakan red/orange secara selektif.

Jangan menjadikan semua enemy merah.

## Pickups

Scrap harus kontras dengan world tetapi tidak glowing berlebihan.

---

# 7. Warm vs Cold Contrast

Ini merupakan visual rule paling penting.

World:

```text
cool
dark
low saturation
```

Train:

```text
warm
slightly brighter
higher local contrast
```

Contoh:

kereta melewati sawah malam.

Sawah:

deep blue-green.

Train windows:

warm amber.

Hasil yang diinginkan:

mata player secara natural kembali ke kereta.

---

# 8. Lighting Direction

Gunakan lighting sederhana dan konsisten.

Sumber cahaya utama:

- train windows
- locomotive headlamp
- station lamps
- moonlight
- occasional lantern
- environmental practical lights

Avoid:

- omnidirectional neon glow
- excessive bloom
- colored rim light tanpa sumber
- glowing every object

Light source harus terasa berasal dari sesuatu yang nyata.

---

# 9. Night Visibility

Night environment tidak boleh berarti scene terlalu gelap.

Black tidak boleh mendominasi gameplay.

Gunakan:

- dark blue
- muted green
- cool gray

daripada pure black.

Pure black hanya untuk:

- deepest shadow
- outline tertentu
- high contrast detail

Enemy harus tetap readable.

---

# 10. Train Design

Kereta terinspirasi kereta diesel regional/lokal lama tanpa meniru model nyata secara langsung.

Visual characteristics:

- sturdy
- utilitarian
- slightly aged
- mechanical
- maintained but worn

Kereta bukan:

- futuristic train
- luxury train
- steam locomotive fantasy
- military armored train

Target era visual:

**ambiguous late-20th-century to contemporary rural railway.**

---

# 11. Locomotive

Locomotive harus menjadi bagian kereta paling mudah dikenali.

Features:

- prominent headlamp
- strong front silhouette
- visible vents
- metallic panels
- slightly worn paint
- mechanical undercarriage

Avoid:

- excessive spikes
- skull decoration
- military armor
- giant mounted cannon

Defense harus terasa improvised, bukan military-grade.

---

# 12. Passenger Car

Passenger car merupakan sumber warmth utama.

Visual:

- warm lit windows
- occasional silhouettes
- simple seats visible through windows
- luggage
- curtains or small interior detail

Dalam scene malam, passenger car harus memberikan rasa:

**people are inside.**

---

# 13. Workshop Car

Workshop car harus terbaca dari silhouette/detail.

Elements:

- work lights
- tool racks
- spare parts
- crates
- repair equipment
- metal textures

Avoid membuatnya seperti sci-fi laboratory.

---

# 14. Defense Car

Defense car terlihat lebih terbuka.

Possible elements:

- small platform
- improvised mounted weapon
- ammo box
- sandbag-like protection
- reinforcement plate

Weapon harus terasa:

**assembled from available equipment.**

---

# 15. Train Wear

Kereta tidak boleh terlihat baru.

Gunakan subtle:

- scratches
- dust
- rust
- paint fading
- patched metal

Tetapi jangan membuat seluruh train menjadi brown rust.

Visual wear harus mendukung cerita, bukan mendominasi desain.

---

# 16. Player Character

Player adalah orang biasa yang mengambil peran sebagai defender.

Avoid:

- superhero silhouette
- futuristic armor
- fantasy warrior
- tactical military operator

Recommended clothing:

- work jacket
- practical shirt
- boots
- trousers
- simple bag/belt
- railway/workwear influence

Character harus terasa cocok berada di kereta.

---

# 17. Character Regional Identity

Nuansa Indonesia/Southeast Asia dapat muncul melalui:

- facial proportions
- skin tones
- practical clothing
- local workwear
- jacket/shirt patterns
- footwear
- headwear tertentu bila relevan

Hindari:

- kostum tradisional lengkap tanpa konteks
- penggunaan batik sebagai shorthand wajib
- exaggerated cultural stereotype

Karakter harus terasa:

**local because of context, not costume.**

---

# 18. Survivor Art

Survivor harus memiliki silhouette sederhana.

Archetypes:

## Montir

Visual hints:

- rolled sleeves
- tool belt
- wrench/tool
- work jacket

## Pedagang

Visual hints:

- sling bag
- simple shirt
- small goods/package

## Perawat

Visual hints:

- practical medical bag
- simple clothing
- recognizable but subtle medical cue

## Penjaga

Visual hints:

- sturdy posture
- flashlight/tool/weapon
- practical outerwear

Jangan membuat survivor seperti hero roster game gacha.

---

# 19. Portrait Rules

Jika portrait digunakan:

- simple bust portrait
- same pixel density
- minimal background
- neutral lighting
- readable face

Avoid:

- dramatic anime portrait
- excessive rim light
- glowing eyes
- rarity frame
- fantasy card treatment

---

# 20. Enemy Direction

Enemy harus terasa mysterious.

Tujuan:

**uncertain whether supernatural, biological, or something else.**

Jangan terlalu cepat mendefinisikan lore melalui visual.

Enemy harus terasa original.

---

# 21. The Mist

Visual idea:

makhluk yang terlihat seperti tubuh kecil/kurus yang sebagian hilang dalam kabut.

Characteristics:

- unstable silhouette
- low posture
- mist-like trailing edges
- unclear facial detail

Movement impression:

quick but simple.

Avoid:

- direct pocong imitation
- standard zombie
- ghost with white sheet

---

# 22. The Shadow

Visual idea:

makhluk tinggi dan tipis dengan gerakan terlalu cepat.

Characteristics:

- elongated limbs
- dark silhouette
- distorted posture
- minimal facial features

Movement dapat lebih penting daripada detail sprite.

Avoid:

- generic black humanoid with glowing red eyes

---

# 23. The Keeper

Visual idea:

heavy forest-associated creature.

Characteristics:

- large upper body
- asymmetrical silhouette
- roots/bark/organic texture hints
- heavy movement

Should feel:

old, territorial, heavy.

Avoid:

- generic orc
- fantasy golem
- tree monster cliché secara literal

---

# 24. Final Boss — Raksasa Alas

Raksasa Alas adalah temporary working concept.

Boss harus terasa berasal dari landscape.

Possible visual motifs:

- twisted vegetation
- wet earth
- bark-like texture
- shadow
- broken railway debris

Scale:

sekitar **2.5–3× player height**.

Tidak perlu sebesar bangunan.

Design principle:

> recognizably massive, still readable within gameplay.

---

# 25. Folklore Influence Rule

Folklore Indonesia dapat menjadi inspirasi mood, tetapi jangan melakukan direct copy kecuali memang diputuskan secara eksplisit.

Prefer:

**inspired-by**

daripada:

**literal adaptation.**

Alasannya:

- lebih original
- lebih bebas secara visual
- tidak jatuh menjadi horror cliché
- tidak mengikat lore terlalu awal

---

# 26. Biome 1 — Farmland

Visual mood:

**quiet rural night.**

Elements:

- rice fields
- irrigation channels
- banana trees
- small houses
- electric poles
- distant hills
- railway crossing
- small roadside structures

Color:

cool green-blue.

Lighting:

occasional warm house/window light.

---

# 27. Farmland Detail Rule

Jangan memenuhi setiap tile dengan object.

Gunakan negative space.

Contoh:

satu hamparan sawah luas lebih efektif daripada:

- rumah
- pohon
- lampu
- pagar
- batu
- rumput
- sign
- haystack

dalam setiap screen.

---

# 28. Biome 2 — Plantation & Forest

Visual mood:

**wet, foggy, increasingly isolated.**

Elements:

- plantation rows
- dense tree line
- narrow bridges
- small maintenance huts
- fog
- overgrown railway infrastructure

Color:

dark teal / blue-green.

Lighting:

very sparse.

---

# 29. Biome 3 — Highland Night

Visual mood:

**cold, exposed, dangerous.**

Elements:

- highland vegetation
- cliffs
- deep valleys
- pine/tropical mountain silhouettes
- thick mist
- old railway structures
- distant mountain

Color:

deep navy / grey-blue.

Potential subtle transition:

night mulai sedikit lebih pucat mendekati akhir perjalanan.

---

# 30. Station Art Direction

Station harus terasa familiar tetapi fictional.

Architecture:

- simple low-rise structure
- tiled or corrugated roof
- covered platform
- benches
- railway signage
- lamps
- ticket/service room

Avoid:

- grand colonial station setiap kali
- ultra-modern station
- hyper-detailed historical recreation

Station V1 harus terasa:

**small regional stop.**

---

# 31. Station Signage

Station name boards menjadi visual anchor.

Format sederhana:

```text
WANASARI
```

atau

```text
STASIUN WANASARI
```

Gunakan typographic style yang konsisten.

Avoid typography yang terlalu ornamental.

---

# 32. Local Props

Useful environmental props:

- motorbike
- bicycle
- stacked sacks
- wooden bench
- plastic chair
- roadside cart
- water tank
- crates
- railway signal
- small warung
- hanging lamp
- tarp
- utility pole
- old maintenance equipment

Props harus digunakan secukupnya.

---

# 33. Vegetation

Vegetation merupakan elemen penting identitas.

Possible vegetation:

- banana plants
- bamboo clusters
- rice
- grass
- shrubs
- tropical trees
- plantation rows

Avoid:

- generic European pine everywhere
- desert vegetation
- fantasy jungle palette

Highland biome boleh memiliki vegetation lebih sparse.

---

# 34. Architecture

Residential architecture:

- modest
- practical
- tropical
- tiled roof
- plaster/wood walls
- small veranda

Tidak harus identik dengan daerah tertentu.

Tujuan:

visual familiarity.

---

# 35. Track & Railway Environment

Railway harus memiliki detail yang membantu immersion.

Include:

- sleepers
- ballast
- switch
- signal
- utility box
- level crossing
- warning signs
- small maintenance structure

Jangan membuat rel sebagai dua garis sederhana dalam final art.

---

# 36. Weather

V1 dapat menggunakan:

- light mist
- occasional rain
- wet ground
- distant lightning only if subtle

Rain bukan requirement setiap biome.

Weather tidak boleh mengurangi combat readability.

---

# 37. Rain Art Rule

Jika hujan digunakan:

- thin lines
- low opacity
- moderate density

Avoid:

- huge rain streaks
- excessive splash particles
- constant thunder flash

---

# 38. Fog

Fog adalah atmospheric layer, bukan gameplay blocker.

Gunakan:

- low-opacity layers
- parallax
- localized mist

Enemy tidak boleh hilang sepenuhnya di fog.

---

# 39. Parallax Art Layers

Minimum visual composition:

## Far Background

- mountains
- sky
- distant forest

## Background

- houses
- trees
- fields

## Midground

- railway environment
- structures
- vegetation

## Gameplay Layer

- train
- player
- enemy
- pickups

## Foreground

- occasional grass/branch/object crossing screen edge

Foreground harus jarang agar tidak menutup gameplay.

---

# 40. Sky

Night sky harus subtle.

Avoid:

- massive stars
- galaxy
- fantasy aurora
- giant moon unless narratively relevant

Prefer:

- cloud cover
- dim moonlight
- subtle stars
- haze

---

# 41. Dawn Transition

Victory memiliki visual transition menuju pagi.

Gunakan:

- gradually lighter horizon
- reduced blue-black
- muted early-morning warmth
- fog becoming brighter

Jangan berubah langsung menjadi sunrise orange.

Transition harus pelan dan understated.

---

# 42. UI Art Direction

UI menggunakan gaya:

**industrial / railway utility**

tetapi sangat restrained.

Possible visual inspiration:

- old ticket printing
- railway labels
- maintenance markings
- stamped numbers
- metal signage

Jangan membuat UI menjadi sepenuhnya skeuomorphic.

---

# 43. UI Surfaces

Prefer:

- dark flat surfaces
- subtle texture
- thin borders
- simple spacing

Avoid:

- floating glossy cards
- glass panels
- neon
- heavy gradients
- giant shadows

---

# 44. UI Color

UI base:

- charcoal
- dark navy
- muted grey

Highlight:

- warm amber
- off-white
- muted red for danger

UI harus menggunakan warna environment yang sama agar cohesive.

---

# 45. Typography Direction

Typography target:

**utilitarian, slightly condensed or neutral sans-serif.**

Title dapat memiliki sedikit custom treatment.

Avoid:

- cyberpunk fonts
- fantasy fonts
- horror dripping fonts
- handwriting fonts

Typography harus tetap modern.

---

# 46. Title Treatment

`LINTAS MALAM`

Harus terasa:

- strong
- simple
- understated
- railway-adjacent

Possible treatment:

spacing sedikit lebar.

Small subtitle:

`KEEP THE TRAIN MOVING`

Tidak perlu emblem kompleks.

---

# 47. Logo Rule

Logo V1 dapat hanya berupa wordmark.

Tidak perlu membuat:

- train icon
- monster silhouette
- badge
- crest

kecuali benar-benar menambah identity.

Simple wordmark lebih baik daripada generic indie-game logo.

---

# 48. Projectile Art

Projectile harus visible tetapi kecil.

Possible:

- warm muzzle flash
- bright bullet tracer
- simple projectile sprite

Avoid:

- laser
- magic orb
- rainbow trail

Weapon feel harus grounded.

---

# 49. Scrap Pickup

Scrap dapat divisualisasikan sebagai:

- metal fragment
- bolt
- small mechanical part

Pickup readability dapat dibantu dengan:

- slight brightness
- subtle bounce
- minimal outline

Avoid:

- giant glowing loot crystal

---

# 50. Effects

Effects harus low-resolution dan mengikuti pixel grid.

Possible:

- smoke
- sparks
- dust
- small debris
- hit flash
- muzzle flash

Avoid:

- soft high-resolution particle effects
- blurred bloom
- inconsistent vector effects

---

# 51. Explosion

Explosion harus singkat.

Sequence:

flash → small fire/debris → smoke.

No giant screen-filling explosion.

Jika train damage besar:

effect harus terasa mechanical.

---

# 52. Smoke

Smoke menjadi important storytelling element.

Train normal:

light exhaust.

Damaged carriage:

irregular smoke.

Critical:

darker/heavier smoke.

Smoke harus mengikuti pixel art style.

---

# 53. Animation Philosophy

Prefer:

**few strong frames**

daripada banyak frame yang tidak konsisten.

Recommended:

Walk:

4–6 frames.

Attack:

3–5 frames.

Hit:

1–2 frames.

Death:

4–6 frames.

Enemy movement dapat lebih minimal.

---

# 54. Animation Weight

Heavy enemy:

slower frames
larger body shift.

Fast enemy:

shorter timing
sharper movement.

Player:

responsive animation.

Train:

subtle movement, suspension, smoke.

---

# 55. Shadow Style

Gunakan simple ground shadow.

Prefer:

- small dark ellipse/block
- low detail
- consistent opacity

Avoid:

- realistic soft shadow
- dynamic ray-traced style
- huge drop shadow

---

# 56. Perspective Consistency

Semua asset harus mengikuti camera yang sama.

Jika world menggunakan top-down 3/4 perspective:

train,
player,
enemy,
props,
station

harus mengikuti angle tersebut.

Asset dengan side-view murni tidak boleh dicampur.

---

# 57. Asset Generation Workflow

Untuk setiap asset category:

1. Define asset specification.
2. Generate small batch.
3. Compare against existing assets.
4. Reject inconsistent outputs.
5. Clean transparent background.
6. Adjust pixel density.
7. Test inside gameplay.
8. Only then mark as approved.

Jangan generate seluruh asset library dalam satu prompt.

---

# 58. Asset Specification Template

Gunakan template seperti:

```text
ASSET:
Passenger Car

FUNCTION:
Train gameplay unit.

VIEW:
3/4 top-down.

STYLE:
Modern pixel art.

SCALE:
Approx. 200×64 px.

LIGHTING:
Cool moonlight with warm interior windows.

MATERIAL:
Aged painted metal.

DETAIL LEVEL:
Medium.

BACKGROUND:
Transparent.

CONSTRAINTS:
No text.
No perspective mismatch.
No neon.
No futuristic details.
No excessive rust.
```

---

# 59. Image Generation Prompt Structure

Recommended prompt structure:

```text
Create a single original game asset for a modern pixel-art top-down
survival game set around a fictional tropical railway at night.

SUBJECT:
[asset]

CAMERA:
Consistent 3/4 top-down view.

STYLE:
Modern pixel art with clean silhouettes, controlled detail,
hard pixel edges, limited shading and consistent pixel density.

LIGHTING:
Cool nighttime ambient light with localized warm practical light.

MOOD:
Grounded, atmospheric, slightly worn, not futuristic.

REGIONAL INFLUENCE:
Subtle Southeast Asian / Indonesian rural railway environment,
communicated through practical design and context rather than
decorative cultural motifs.

BACKGROUND:
Transparent.

AVOID:
neon, cyberpunk, fantasy ornament, excessive glow,
high-resolution painterly rendering, text, logos,
overly smooth gradients and generic AI-game aesthetics.
```

Lalu tambahkan subject-specific requirement.

---

# 60. Character Generation Rule

Jika menggunakan generated characters:

generate character concept terlebih dahulu.

Kemudian turunkan menjadi:

- idle sprite
- movement
- attack
- hit
- death

Jangan generate masing-masing animation frame secara independen tanpa master design.

Character consistency lebih penting daripada detail.

---

# 61. Sprite Sheet Rule

Jika image generation menghasilkan sprite sheet:

periksa:

- same character proportions
- consistent weapon
- same clothing
- same direction
- same lighting
- same pixel density

Jika frame berubah desain:

jangan digunakan.

---

# 62. Train Asset Rule

Train harus dibuat sebagai system.

Generate:

1. locomotive master design
2. carriage visual language
3. passenger
4. workshop
5. defense

Semua gerbong harus terlihat berasal dari operator/train set yang sama.

Avoid menghasilkan setiap gerbong dengan prompt yang tidak saling terkait.

---

# 63. Enemy Asset Rule

Enemy berbeda tetapi harus berasal dari dunia yang sama.

Common characteristics dapat berupa:

- similar shadow treatment
- material texture
- muted palette
- ambiguous organic forms

Jangan membuat satu enemy seperti zombie, satu seperti anime demon, satu seperti fantasy golem.

---

# 64. Biome Asset Rule

Environment sebaiknya dibangun dari modular asset.

Examples:

- field tile
- grass
- tree
- building
- pole
- railway sign
- fence
- rock
- platform

Lebih baik kombinasi modular daripada satu giant generated background image.

Alasannya:

- parallax
- reuse
- responsiveness
- visual control
- performance

---

# 65. Generated Background Policy

Large generated background images boleh digunakan untuk:

- menu
- promotional art
- loading artwork
- distant matte layer

Jangan menjadikannya primary gameplay environment jika membuat camera/parallax sulit dikontrol.

---

# 66. Texture Rule

Pixel texture harus restrained.

Metal:

sedikit scratches.

Wood:

minimal grain.

Ground:

controlled noise.

Vegetation:

clustered pixels.

Avoid noisy AI-generated surface.

---

# 67. Anti-AI-Slop Visual Checklist

Reject asset jika memiliki:

- excessive glow
- random tiny details
- unclear silhouette
- impossible perspective
- inconsistent lighting
- random symbols
- unreadable fake text
- decorative clutter
- overdesigned costume
- unnecessary straps/pouches
- fantasy-looking weapon
- mismatched pixel size
- painterly blur
- neon accents without function

---

# 68. Fake Text Rule

Image generation sering menghasilkan unreadable text.

Tidak boleh ada generated text pada:

- station signs
- train markings
- posters
- labels

Generate surface kosong.

Tambahkan text secara programmatically atau manual.

---

# 69. Cultural Sensitivity Rule

Visual yang terinspirasi budaya lokal harus didasarkan pada context.

Jangan menggunakan:

- religious symbols sebagai decoration
- sacred imagery sebagai generic horror prop
- real ethnic attire secara acak
- caricature accent dalam visual
- identifiable cultural object tanpa kebutuhan

Jika unsur budaya spesifik masuk di masa depan, lakukan research terlebih dahulu.

---

# 70. Asset Naming Convention

Recommended:

```text
assets/
  characters/
    player_idle.png
    player_walk.png

  enemies/
    mist_walk.png
    shadow_walk.png
    keeper_walk.png

  train/
    locomotive.png
    carriage_passenger.png
    carriage_workshop.png
    carriage_defense.png

  environment/
    biome_farmland/
    biome_forest/
    biome_highland/

  ui/
  fx/
```

Asset names harus descriptive.

Hindari:

```text
image1.png
asset_final2.png
generated_new.png
```

---

# 71. Approved Asset Criteria

Asset hanya dianggap approved jika:

- silhouette readable
- perspective correct
- pixel density correct
- color fits palette
- lighting fits scene
- scale fits gameplay
- transparent background clean
- no fake text
- no random artifact
- consistent with existing asset family

---

# 72. Screenshot Test

Ambil screenshot gameplay tanpa UI.

Jika visual direction berhasil, screenshot harus langsung menunjukkan:

- kereta sebagai focal point
- perjalanan malam
- landscape tropis
- danger around train
- warm-vs-cold lighting

Jika screenshot terlihat seperti generic forest survival:

art direction belum cukup kuat.

---

# 73. Thumbnail Test

Scale screenshot menjadi kecil.

Kereta, player, dan enemy masih harus dapat dibedakan.

Jika semua object menyatu:

silhouette atau color hierarchy perlu diperbaiki.

---

# 74. Grayscale Test

Sesekali cek screenshot dalam grayscale.

Pastikan:

- player terbaca
- train terbaca
- enemy archetype berbeda
- gameplay interactable berbeda dari environment

Jangan bergantung pada hue saja.

---

# 75. Final Art North Star

Visual ideal Lintas Malam adalah:

> Sebuah kereta tua yang bercahaya hangat bergerak melewati sawah,
> perkebunan, hutan, dan pegunungan tropis di malam hari,
> dikelilingi makhluk misterius yang terasa berasal dari landscape itu sendiri.

Dunia harus terasa familiar.

Tetapi situasinya tidak.

---

# 76. Art Definition of Done

Art direction V1 dianggap berhasil jika:

1. seluruh gameplay asset terlihat berasal dari game yang sama,
2. kereta menjadi focal point utama,
3. nuansa lokal terasa tanpa ornamentasi berlebihan,
4. combat tetap readable,
5. screenshot mempunyai identitas yang jelas,
6. generated assets tidak terlihat seperti kumpulan output AI yang tidak konsisten,
7. player dapat mengenali biome hanya dari environment,
8. warm-vs-cold lighting tetap konsisten,
9. enemy mempunyai silhouette berbeda,
10. keseluruhan visual terasa deliberate, bukan generated-by-default.