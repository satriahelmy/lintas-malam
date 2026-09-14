# Lintas Malam
## Game & Interface Design Specification

**Version:** 0.1  
**Related Document:** `PRD.md`  
**Platform:** Desktop Web  
**Target Resolution:** 1920×1080 design reference, responsive down to 1280×720  
**Genre:** Top-Down Train Survival / Action Roguelite

---

# 1. Design Goal

Lintas Malam harus terasa seperti sebuah **perjalanan malam yang berbahaya**, bukan arena shooter yang kebetulan memiliki kereta.

Setiap keputusan visual dan interaction design harus mendukung tiga hal:

1. Kereta adalah pusat permainan.
2. Dunia terasa terus bergerak.
3. Pemain merasa sedang membawa orang menuju tempat yang aman.

Target experience:

> Lonely, tense, atmospheric, but still warm around the train.

Dunia di luar kereta terasa dingin dan berbahaya.

Kereta terasa seperti satu-satunya tempat aman yang masih bergerak.

---

# 2. Design Principles

## 2.1 Gameplay First

Visual tidak boleh mengurangi readability gameplay.

Player harus selalu dapat membedakan:

- player
- enemy
- projectile
- pickup
- train
- danger area

dalam waktu singkat.

---

## 2.2 Train Is the Visual Anchor

Kereta harus menjadi elemen paling mudah dikenali di layar.

Environment boleh detail, tetapi tidak boleh mengalahkan visual hierarchy kereta.

---

## 2.3 Controlled Visual Density

Jangan memenuhi layar dengan:

- decorative particles
- glowing effects
- floating labels
- unnecessary panels
- excessive outlines
- excessive icons

Gunakan detail hanya ketika membantu atmosphere atau gameplay.

---

## 2.4 Diegetic Where Possible

Jika informasi dapat disampaikan melalui dunia game, prioritaskan itu dibanding UI tambahan.

Contoh:

Gerbong rusak dapat:

- mengeluarkan asap
- memiliki lampu berkedip
- terlihat retak

daripada hanya menampilkan warning panel besar.

---

## 2.5 Local Through Observation

Nuansa lokal muncul melalui:

- bentuk stasiun
- vegetation
- railway infrastructure
- rumah
- warung
- signage
- pakaian karakter
- landscape
- small environmental props

Bukan melalui ornamentasi tradisional yang ditempelkan di setiap interface.

---

# 3. Camera

Gunakan:

**Top-down dengan sedikit perspective / angled view.**

Camera mengikuti kereta.

Kereta secara visual berada sedikit ke kiri dari center sehingga tersedia ruang pandang lebih luas ke arah perjalanan.

Reference composition:

```text
+------------------------------------------------------+
|                                                      |
|                     WORLD                            |
|                                                      |
|        enemies                      enemies          |
|                                                      |
|             ==========================>              |
|             TRAIN                                    |
|                                                      |
|        enemies                      enemies          |
|                                                      |
|                                                      |
+------------------------------------------------------+
```

Arah perjalanan utama:

**Left → Right**

Environment bergerak:

**Right → Left**

untuk menciptakan sensasi forward movement.

---

# 4. Camera Behavior

Camera secara umum stabil.

Camera tidak mengikuti setiap gerakan kecil player.

Player bergerak relatif terhadap kereta.

Gunakan subtle camera shake hanya pada:

- heavy train impact
- explosion
- boss attack
- major event

Durasi shake harus singkat.

Jangan gunakan continuous camera bobbing.

---

# 5. Gameplay Space

Kereta menempati sekitar:

**35–50% horizontal gameplay width**

tergantung kondisi layar.

Area di sekitar kereta merupakan combat space.

Enemy dapat mendekati dari:

- upper side
- lower side
- rear
- occasionally front

Jangan membuat player harus bergerak terlalu jauh dari kereta.

Kereta adalah arena utama.

---

# 6. Train Layout

Default arrangement:

```text
TRAVEL DIRECTION →

[ Defense ]—[ Workshop ]—[ Passenger ]—[ Locomotive ]
```

Namun orientasi dapat dibalik jika implementasi visual lebih natural.

Setiap gerbong harus memiliki silhouette berbeda.

## Locomotive

Visual:

- paling besar
- strong front shape
- brighter primary lamp
- mechanical details

Harus langsung terbaca sebagai bagian terpenting.

## Passenger Car

Visual:

- warm windows
- visible silhouettes inside
- luggage / passenger details

Memberikan emotional contrast terhadap dunia luar.

## Workshop Car

Visual:

- tools
- equipment
- spare parts
- industrial interior

## Defense Car

Visual:

- turret/platform
- ammunition/storage elements
- defensive silhouette

Jangan hanya mengganti warna antar-gerbong.

---

# 7. Player Design Requirements

Player harus mudah ditemukan bahkan ketika banyak enemy muncul.

Gunakan:

- distinctive silhouette
- readable movement
- subtle selection/ground marker bila diperlukan

Jangan gunakan permanent glowing aura besar.

Player animation minimum:

- idle
- move
- attack
- hit
- death

Jika animation asset belum tersedia, gameplay prototype boleh menggunakan simplified animation.

---

# 8. Enemy Readability

Setiap enemy archetype harus dikenali dari:

**silhouette + movement**, bukan warna saja.

### The Mist

Small / medium silhouette.

Movement:

direct and predictable.

### The Shadow

Thin / aggressive silhouette.

Movement:

fast and irregular.

### The Keeper

Large heavy silhouette.

Movement:

slow and deliberate.

Dalam kondisi grayscale sekalipun, ketiganya idealnya tetap dapat dibedakan.

---

# 9. Combat Feedback

Combat harus memiliki feedback yang jelas tetapi restrained.

Saat projectile mengenai enemy:

- small impact effect
- very short hit flash
- subtle recoil/stagger where appropriate

Enemy death:

- short death animation
- minimal particles
- Scrap drop when applicable

Avoid:

- giant damage numbers
- constant screen shake
- excessive sparks
- rainbow effects
- oversized explosions

Damage numbers tidak wajib.

Jika digunakan, tampilkan kecil dan singkat.

---

# 10. Train Damage Feedback

Kondisi train harus dapat dibaca tanpa selalu melihat HUD.

## Healthy

- stable lights
- clean movement
- normal mechanical sound

## Damaged

- occasional sparks
- visible damage
- intermittent smoke

## Critical

- stronger smoke
- flickering lights
- warning sound
- visible mechanical instability

Jangan menggunakan red flashing overlay seluruh layar kecuali untuk event sangat singkat.

---

# 11. HUD Layout

HUD harus minimal.

Recommended layout:

```text
+------------------------------------------------------+
| PLAYER HP                            JOURNEY  42%     |
|                                                      |
|                                                      |
|                                                      |
|                                                      |
|                    GAMEPLAY                          |
|                                                      |
|                                                      |
|                                                      |
| TRAIN HP                              SCRAP  128      |
+------------------------------------------------------+
```

Exact placement dapat berubah setelah gameplay testing.

Prioritas informasi:

1. Player HP
2. Train/Locomotive HP
3. Journey progress
4. Scrap
5. Survivor count

Informasi lain hanya muncul ketika relevan.

---

# 12. HUD Visual Style

HUD tidak menggunakan large floating cards.

Gunakan:

- compact indicators
- simple typography
- restrained borders
- subtle backgrounds only when readability requires them

Avoid:

```text
╭──────────────────────────────╮
│ ✨ PLAYER STATUS ✨          │
│ ❤️ Health        100/100     │
│ ⚡ Energy         75/100     │
│ 💰 Scrap              128    │
╰──────────────────────────────╯
```

Prefer:

```text
HP  ███████░░

TRAIN  █████░░░

SCRAP  128
```

Interface harus terasa seperti bagian dari game, bukan dashboard SaaS.

---

# 13. Journey Indicator

Player harus memahami bahwa perjalanan memiliki tujuan.

Gunakan progress indicator sederhana.

Contoh:

```text
●─────────●─────────●─────────◆
START    ST.01     ST.02     HOME
```

Tidak perlu mini-map.

Indicator dapat muncul lebih lengkap ketika transition atau station.

Saat gameplay normal cukup tampilkan progress kecil.

---

# 14. Main Menu

Main menu harus sederhana.

Composition:

```text
                 LINTAS MALAM

              Keep the train moving.


                   [ PLAY ]

                   Settings
                   Credits
```

Background:

kereta berhenti atau bergerak perlahan di malam hari.

Gunakan subtle environmental animation:

- smoke
- rain/mist
- vegetation movement
- train lights

Hindari animated particles yang berlebihan.

---

# 15. Game Start

Klik **PLAY**.

Jangan langsung memberikan modal tutorial besar.

Gunakan contextual onboarding.

Contoh:

```text
WASD
Move
```

kemudian:

```text
Mouse
Aim

Left Click
Fire
```

Instruction menghilang setelah player melakukan action.

Target:

player mulai bermain dalam **<10 seconds**.

---

# 16. Upgrade Selection

Ketika upgrade muncul:

- gameplay pause
- background sedikit dim
- tiga pilihan muncul

Layout:

```text
                CHOOSE AN UPGRADE


        RAPID FIRE

        Fire Rate +20%


        HEAVY ROUND

        Damage +25%


        REINFORCED CAR

        Train Max HP +15%
```

Desktop dapat menampilkan ketiganya horizontal.

Cards harus sederhana.

Jangan menggunakan:

- gradient neon
- glassmorphism
- excessive glow
- floating decorative icons
- rainbow rarity borders

Upgrade harus terbaca dalam 2–3 detik.

---

# 17. Station Transition

Saat mendekati stasiun:

combat intensity menurun.

Environment memperlihatkan tanda-tanda civilization.

Contoh:

- railway signal
- station lights
- houses
- platform
- signage

Train melambat.

Text kecil muncul:

```text
STASIUN WANASARI
00:47
```

Kereta berhenti.

Audio train berubah.

Kemudian station interaction dimulai.

---

# 18. Station Screen

Station tidak menggunakan menu RPG kompleks.

Gameplay view tetap terlihat.

Overlay interaction muncul di atas world.

Example:

```text
STASIUN WANASARI

Scrap: 124


Repair Locomotive
60 Scrap


Recruit Survivor
Available


Upgrade Defense
80 Scrap


                    DEPART
```

Player harus dapat menyelesaikan station phase dalam sekitar 20–40 detik.

---

# 19. Survivor Presentation

Survivor bukan sekadar perk icon.

Ketika ditemukan:

small character portrait atau sprite muncul.

Contoh:

```text
MANG DARSA
Montir

Repair effectiveness +25%
```

Character presentation harus terasa grounded.

Hindari:

- fantasy rarity
- ★★★★★
- legendary survivor
- glowing portrait
- loot-box presentation

Survivor adalah manusia biasa yang ikut dalam perjalanan.

---

# 20. Boss Introduction

Boss introduction harus singkat.

Contoh:

Environment mulai gelap.

Train light flickers.

Music/ambience berubah.

Movement di hutan terlihat.

Kemudian:

```text
Raksasa Alas
```

Nama muncul sekitar 1–2 detik.

Boss memasuki gameplay.

Tidak perlu cinematic panjang.

---

# 21. Game Over

Game Over tidak menggunakan dramatic giant red text.

Transition:

- train slows
- locomotive loses power
- lights turn off
- environment continues briefly
- sound fades

Kemudian:

```text
THE TRAIN NEVER ARRIVED


Distance        82%
Enemies         143
Survivors         3
Time          11:42


RETRY

Main Menu
```

Copy final dapat dilokalkan kemudian.

---

# 22. Victory

Victory harus memiliki emotional contrast.

Setelah boss:

enemy berhenti.

Langit perlahan lebih terang.

Environment mulai menunjukkan tanda pagi.

Kereta memasuki destination station.

Result:

```text
YOU MADE IT HOME


Survivors Saved     4
Train Condition    38%
Enemies Defeated   167
Journey          13:21
```

Scene harus memberikan sedikit waktu untuk bernapas sebelum result screen.

---

# 23. Motion Design

Motion harus memiliki purpose.

Gunakan animation untuk:

- train movement
- environment parallax
- combat feedback
- UI transition
- station arrival
- boss introduction

Avoid:

- floating UI
- looping button animation
- excessive hover motion
- unnecessary bounce
- constant pulsing elements

UI transition ideal:

**100–250 ms**

World animation dapat lebih lambat.

---

# 24. Parallax

Environment minimal memiliki tiga depth layers.

Example:

```text
BACKGROUND
mountains / distant forest

MIDGROUND
houses / trees / fields

FOREGROUND
grass / railway props

TRAIN
```

Kecepatan scrolling berbeda untuk menciptakan depth.

Jangan menggunakan terlalu banyak layers jika mengganggu performance.

---

# 25. Lighting

Lighting merupakan bagian penting visual identity.

World:

**cool + dark**

Train:

**warm + illuminated**

Tujuan:

ketika screenshot game dilihat tanpa logo, viewer tetap mengenali pusat visual berupa kereta hangat yang bergerak melalui dunia malam.

Lighting tidak boleh membuat enemy sulit terlihat.

---

# 26. Typography

Gunakan maksimal:

**1 primary typeface + optional display treatment untuk title.**

Typography harus:

- readable
- slightly utilitarian
- tidak terlalu futuristic
- tidak terlalu decorative

Avoid generic AI-game typography:

- glowing cyberpunk font
- fantasy serif
- excessive condensed uppercase everywhere

UI text dapat menggunakan uppercase secara selektif.

---

# 27. Iconography

Gunakan icon hanya untuk informasi yang lebih cepat dipahami secara visual.

Examples:

- Scrap
- Health
- Repair
- Train
- Survivor

Icon style harus konsisten.

Jangan mencampur:

- emoji
- outline icons
- filled icons
- detailed illustrations

dalam satu interface.

**Do not use emoji as production UI icons.**

---

# 28. Environmental Storytelling

Environment harus sesekali memberikan cerita kecil.

Contoh:

- sepeda ditinggalkan dekat perlintasan
- warung sudah tutup
- lampu rumah masih menyala
- sawah terbengkalai
- luggage di platform
- railway signal rusak
- papan stasiun tua
- abandoned maintenance cart

Tidak perlu menjelaskan semuanya melalui text.

---

# 29. Regional Design Rules

Inspirasi lokal harus terasa natural.

Good:

- station architecture yang familiar
- tiled roofs
- tropical vegetation
- railway crossing
- warung kecil
- field patterns
- Indonesian-style signage
- clothing silhouette yang grounded

Bad:

- batik pattern di seluruh UI
- wayang sebagai decorative border tanpa konteks
- semua bangunan berbentuk rumah adat
- random traditional ornament
- penggunaan simbol budaya hanya karena terlihat "Indonesia"

Prinsip:

> Environment first, ornament last.

---

# 30. Anti-AI-Slop Rules

Ini merupakan hard design constraint.

## DO NOT

Gunakan secara default:

- glassmorphism
- neon gradients
- purple-blue gradient
- excessive rounded cards
- floating dashboard panels
- excessive drop shadows
- giant hero typography
- meaningless decorative blobs
- random glow
- excessive particles
- gradient borders
- generic futuristic HUD
- unnecessary badges
- excessive iconography
- emoji UI
- random cultural ornament
- inconsistent visual styles

## DO

Prioritaskan:

- clear hierarchy
- intentional spacing
- strong composition
- limited visual vocabulary
- functional UI
- consistent typography
- consistent sprite proportions
- restrained effects
- environmental storytelling
- visual references grounded in real-world observation

Setiap visual element harus menjawab:

> "Apa fungsi elemen ini?"

Jika jawabannya hanya:

> "Supaya lebih keren."

pertimbangkan untuk menghapusnya.

---

# 31. Asset Consistency

Generated assets tidak boleh langsung dianggap production-ready.

Sebelum integration, periksa:

- perspective
- scale
- lighting direction
- pixel density
- silhouette
- palette
- outline thickness
- transparency
- shadow style

Jika asset tidak konsisten dengan asset lain:

**regenerate atau edit.**

Jangan memaksa asset yang tidak cocok masuk ke game hanya karena sudah dibuat.

---

# 32. Placeholder Policy

Prototype diperbolehkan menggunakan:

- rectangles
- circles
- simple temporary sprites
- basic icons

Jangan menghabiskan waktu mempercantik placeholder.

Urutan:

```text
Mechanic works
↓
Gameplay feels good
↓
Layout validated
↓
Final asset generated
↓
Asset integrated
↓
Polish
```

---

# 33. Responsive Behavior

Target utama desktop.

Untuk layar lebih kecil:

- gameplay area scale proportionally
- HUD tetap readable
- jangan mengubah gameplay menjadi mobile layout

Minimum supported:

**1280×720**

Jika viewport terlalu kecil, tampilkan notice bahwa desktop resolution direkomendasikan.

---

# 34. Performance Design

Target:

**60 FPS pada laptop desktop modern.**

Prioritaskan:

- sprite reuse
- object pooling untuk projectile/enemy bila diperlukan
- reasonable particle counts
- compressed assets
- limited simultaneous effects

Visual polish tidak boleh mengorbankan gameplay responsiveness.

---

# 35. Accessibility

Minimum:

- UI text readable
- important states tidak dibedakan hanya berdasarkan warna
- screen shake dapat dikurangi/dimatikan
- audio volume controls
- clear pause functionality

Color blindness harus dipertimbangkan saat menentukan enemy/projectile readability.

---

# 36. Prototype Visual Target

Prototype pertama **tidak perlu terlihat seperti final game**.

Prototype dianggap visual-successful apabila:

- train mudah dikenali
- player mudah ditemukan
- enemy archetypes dapat dibedakan
- projectile terlihat
- Scrap terlihat
- HP/status dapat dibaca
- perjalanan terasa bergerak
- UI tidak mengganggu gameplay

---

# 37. Final Visual Target

V1 harus dapat menghasilkan screenshot yang secara langsung mengkomunikasikan:

> Sebuah kereta malam yang hangat sedang bergerak melewati lanskap gelap sementara seseorang mempertahankannya dari makhluk yang mengejar.

Jika screenshot terlihat seperti:

> generic survival game + train sprite

maka visual direction belum berhasil.

---

# 38. Design Validation Checklist

Sebelum feature dianggap selesai, tanyakan:

### Gameplay

- Apakah player memahami apa yang terjadi?
- Apakah target mudah dikenali?
- Apakah train terasa penting?

### UI

- Apakah informasi ini memang perlu selalu terlihat?
- Bisakah panel ini diperkecil atau dihilangkan?
- Apakah hierarchy jelas?

### Visual

- Apakah silhouette readable?
- Apakah asset konsisten?
- Apakah effect terlalu berlebihan?

### Identity

- Apakah dunia terasa seperti perjalanan?
- Apakah nuansa lokal muncul secara natural?
- Apakah screenshot mempunyai karakter sendiri?

### AI-Slop Check

- Apakah elemen ini terlihat seperti generic AI-generated game UI?
- Apakah visual style berubah antar-screen?
- Apakah ada decoration tanpa fungsi?
- Apakah terlalu banyak glow, card, gradient, atau particle?

Jika iya:

**simplify.**

---

# 39. Implementation Decision Rule

Ketika developer/agent harus memilih antara:

**more features**

atau

**better game feel**

pilih:

**better game feel.**

Ketika harus memilih antara:

**more visual effects**

atau

**better readability**

pilih:

**better readability.**

Ketika harus memilih antara:

**generic polish**

atau

**stronger game identity**

pilih:

**stronger game identity.**

---

# 40. Design Definition of Done

Design implementation V1 dianggap berhasil jika pemain dapat melihat gameplay selama beberapa detik dan memahami:

**"Saya berada di sebuah kereta yang bergerak. Sesuatu sedang menyerangnya. Saya harus mempertahankan kereta ini sampai tujuan."**

tanpa membutuhkan tutorial panjang atau penjelasan developer.