# Lintas Malam
## Product Requirements Document

**Version:** 0.1  
**Status:** Prototype / V1  
**Platform:** Web Desktop  
**Genre:** Top-Down Train Survival / Action Roguelite  
**Working Title:** Lintas Malam  
**Tagline:** *Keep the train moving.*

---

# 1. Product Overview

**Lintas Malam** adalah game survival berbasis browser tentang sebuah kereta malam yang harus terus bergerak melewati jalur berbahaya hingga mencapai stasiun tujuan.

Pemain berada di atas kereta dan harus mempertahankan lokomotif, gerbong, serta para penumpang dari makhluk misterius yang menyerang sepanjang perjalanan.

Pemain mengumpulkan **Scrap**, meningkatkan kemampuan karakter dan kereta, menyelamatkan penumpang, serta berhenti di beberapa stasiun untuk mempersiapkan perjalanan berikutnya.

Game menggunakan dunia fiktif yang terinspirasi lanskap dan suasana Indonesia tanpa merepresentasikan daerah tertentu secara literal.

Satu sesi permainan V1 ditargetkan berlangsung sekitar **10–15 menit**.

---

# 2. Product Vision

Lintas Malam harus terasa seperti perjalanan berbahaya, bukan sekadar arena survival dengan kereta sebagai background.

Tiga elemen utama yang membentuk identitas game:

**The Train**

Kereta merupakan pusat permainan dan harus dilindungi.

**The Journey**

Environment terus berubah selama kereta bergerak sehingga pemain merasakan perjalanan menuju suatu tempat.

**The Passengers**

Tujuan pemain bukan hanya bertahan hidup, tetapi membawa sebanyak mungkin penumpang sampai tujuan.

---

# 3. Design Principles

## 3.1 Simple to Learn

Kontrol harus dapat dipahami dalam beberapa detik.

Player tidak perlu membaca tutorial panjang sebelum mulai bermain.

## 3.2 Difficult to Survive

Kompleksitas muncul dari kombinasi enemy, posisi player, kondisi gerbong, upgrade, dan resource management.

## 3.3 The Train Must Matter

Kereta bukan decorative background.

Kondisi kereta harus memengaruhi gameplay dan keputusan pemain.

## 3.4 Journey Over Arena

Game harus memberikan sensasi bergerak melewati dunia.

Background, biome, stasiun, dan progression harus memperkuat konsep perjalanan.

## 3.5 Local Without Becoming a Caricature

Inspirasi Indonesia muncul melalui environment, arsitektur, karakter, nama, ambience, dan detail visual.

Hindari penggunaan simbol budaya secara berlebihan hanya untuk membuat game terlihat "Indonesia".

---

# 4. Target Platform

V1 ditujukan untuk:

- Desktop browser
- Keyboard + mouse
- Landscape orientation
- Resolusi minimum 1280×720

Mobile support bukan requirement V1.

Game harus dapat dijalankan secara lokal dan tidak membutuhkan backend untuk gameplay utama.

---

# 5. Core Gameplay Loop

Core loop:

**Travel → Fight → Collect → Upgrade → Station → Travel**

### Travel

Kereta terus bergerak sepanjang jalur.

Environment bergerak relatif terhadap kereta untuk menciptakan ilusi perjalanan.

### Fight

Enemy mendekati kereta dan mencoba menyerang player atau gerbong.

Player mempertahankan kereta menggunakan weapon.

### Collect

Enemy dapat menjatuhkan Scrap.

Player mengambil Scrap selama perjalanan.

### Upgrade

Pada milestone tertentu pemain memperoleh pilihan upgrade.

### Station

Pada titik tertentu kereta berhenti di sebuah stasiun.

Player dapat memperbaiki kereta, mendapatkan upgrade, atau menyelamatkan penumpang.

Kemudian perjalanan dilanjutkan.

---

# 6. Game Structure

Satu run terdiri dari:

**Departure → Biome 1 → Station → Biome 2 → Station → Biome 3 → Final Boss → Destination**

Target durasi:

| Section | Target |
|---|---:|
| Departure / onboarding | ~1 min |
| Biome 1 | ~3 min |
| Station | ~30 sec |
| Biome 2 | ~3 min |
| Station | ~30 sec |
| Biome 3 | ~3 min |
| Boss | ~2 min |
| Result | — |

Durasi merupakan target balancing, bukan timer yang harus selalu presisi.

---

# 7. Player

Player merupakan penjaga kereta.

## Base Attributes

Player minimal memiliki:

- Health
- Movement Speed
- Damage
- Fire Rate
- Weapon Range

## Controls

Recommended default:

**WASD** — Movement  
**Mouse** — Aim  
**Left Click** — Attack / Shoot  
**ESC** — Pause

Control akhir dapat disesuaikan selama tetap sederhana.

---

# 8. Combat

Combat harus menjadi sistem real-time.

Player dapat bergerak di area kereta sambil menyerang enemy yang datang.

Minimum combat feedback:

- projectile
- enemy hit reaction
- damage indication
- enemy death
- player damage
- train damage

V1 tidak membutuhkan sistem weapon inventory kompleks.

Satu base weapon cukup untuk prototype.

Upgrade dapat mengubah karakteristik weapon tersebut.

---

# 9. Train System

Kereta merupakan objective utama.

Train V1 terdiri dari empat bagian:

**Locomotive → Passenger Car → Workshop Car → Defense Car**

Masing-masing memiliki HP.

## Locomotive

Bagian paling penting.

Jika Locomotive HP mencapai 0:

**Game Over.**

## Passenger Car

Menampung survivor.

Kerusakan berat pada gerbong ini dapat menghilangkan sebagian benefit survivor.

## Workshop Car

Memberikan bonus terhadap repair atau train-related upgrade.

## Defense Car

Mendukung kemampuan ofensif kereta.

Implementasi V1 dapat menggunakan satu passive defense/turret sederhana.

---

# 10. Enemy System

V1 memiliki minimal **3 regular enemy archetypes**.

## The Mist

Enemy dasar.

Karakteristik:

- jumlah banyak
- HP rendah
- movement normal
- menyerang gerbong terdekat

Tujuan desain:

Mengajarkan basic combat.

## The Shadow

Enemy cepat.

Karakteristik:

- movement speed tinggi
- HP rendah–medium
- menyerang player atau bagian lemah kereta

Tujuan desain:

Memaksa player berpindah posisi.

## The Keeper

Enemy berat.

Karakteristik:

- movement lambat
- HP tinggi
- damage terhadap gerbong tinggi

Tujuan desain:

Menjadi priority target.

Nama tersebut merupakan placeholder dan dapat berubah saat worldbuilding.

---

# 11. Boss

V1 memiliki satu final boss.

Working name:

**Raksasa Alas**

Boss muncul menjelang destination.

Boss harus memiliki minimal:

- high HP
- basic attack
- area attack atau special attack
- dua behavior/state berbeda

Boss tidak membutuhkan cinematic kompleks.

Intro sederhana sudah cukup.

---

# 12. Scrap Economy

**Scrap** merupakan resource utama dalam satu run.

Scrap diperoleh dari:

- enemy drops
- encounter rewards
- station rewards

Scrap digunakan untuk:

- repair train
- upgrade tertentu
- station purchase

Scrap tidak perlu disimpan antar-run pada V1.

---

# 13. Upgrade System

Player secara berkala diberikan pilihan **1 dari 3 upgrade**.

Contoh:

**Rapid Fire**  
Fire Rate +20%

**Heavy Round**  
Damage +25%

**Long Barrel**  
Range +20%

**Reinforced Carriage**  
Train Max HP +15%

**Emergency Repair**  
Restore train HP

**Defense Turret**  
Improve Defense Car attack

Upgrade dapat memiliki beberapa level jika implementasinya sederhana.

Tidak diperlukan skill tree untuk V1.

---

# 14. Survivor System

Survivor adalah penumpang yang ditemukan selama perjalanan atau di stasiun.

Setiap survivor memberikan passive bonus.

Contoh:

### Montir

Repair effectiveness +25%.

### Pedagang

Station purchase cost berkurang.

### Perawat

Player mendapatkan sedikit health recovery.

### Penjaga

Train defense meningkat.

Survivor harus direpresentasikan sebagai karakter, bukan hanya angka statistik.

V1 cukup memiliki **4 survivor archetypes**.

Tidak diperlukan relationship system atau dialogue tree.

---

# 15. Station System

Kereta berhenti dua kali sebelum final destination.

Station merupakan safe zone sementara.

Tidak ada enemy attack selama station phase.

Player mendapatkan beberapa pilihan tindakan.

Contoh:

**Repair Train**

Menggunakan Scrap untuk memperbaiki gerbong.

**Upgrade**

Membeli atau mendapatkan upgrade.

**Rescue Survivor**

Menambahkan satu survivor.

Tidak semua pilihan harus tersedia di setiap stasiun.

Station phase harus singkat agar tidak memutus flow game.

---

# 16. Biomes

V1 memiliki **3 biome**.

## Biome 1 — Farmland

Inspirasi:

- sawah
- desa kecil
- pepohonan
- bukit jauh

Atmosphere:

Relatif tenang dan menjadi introduction.

## Biome 2 — Plantation & Forest

Inspirasi:

- perkebunan
- hutan
- kabut
- jembatan kecil
- pegunungan

Atmosphere:

Lebih gelap dan berbahaya.

## Biome 3 — Highland Night

Inspirasi:

- pegunungan
- jurang
- hutan lebat
- kabut malam

Atmosphere:

Paling gelap dan hostile.

Setiap biome tidak membutuhkan gameplay mechanic unik pada V1.

Perbedaan utama dapat berasal dari visual, enemy composition, dan difficulty.

---

# 17. World & Regional Identity

Dunia Lintas Malam bersifat fiktif.

Inspirasi lokal dapat muncul melalui:

- landscape
- station architecture
- vegetation
- signage
- character clothing
- train details
- fictional place names
- food/vendor details
- environmental props

Contoh nama lokasi:

- Stasiun Cibiru
- Lembah Aruna
- Perkebunan Wanasari
- Jalur Gunung Karsa

Nama tersebut masih placeholder.

Game tidak perlu mengklaim merepresentasikan lokasi nyata tertentu.

---

# 18. Visual Direction

Target visual:

**Modern Pixel Art**

Bukan pixel art ultra-low-resolution.

Visual harus:

- readable
- atmospheric
- cohesive
- slightly cinematic
- suitable for browser rendering

Dominant atmosphere:

**Cool night environment + warm train lighting.**

Kereta harus menjadi titik visual paling jelas di layar.

Visual detail lengkap akan didefinisikan di `art-direction.md`.

---

# 19. Camera

Recommended:

**Top-down / slightly angled top-down camera.**

Kereta menjadi pusat gameplay area.

Environment bergerak untuk memberikan sensasi perjalanan.

Camera shake ringan dapat digunakan saat:

- heavy damage
- explosion
- boss attack

Camera shake tidak boleh mengganggu aiming.

---

# 20. UI Requirements

Minimum HUD:

- Player HP
- Locomotive HP
- Scrap
- Current progress
- Survivor count
- Current weapon/upgrade information

Additional screens:

- Main Menu
- Pause
- Upgrade Selection
- Station
- Game Over
- Victory / Destination Result

UI harus sederhana dan tidak menutupi gameplay.

---

# 21. Audio

Audio bukan blocker untuk playable prototype tetapi merupakan bagian V1 polished build.

Minimum target:

- train movement ambience
- weapon sound
- enemy hit/death
- train damage
- Scrap pickup
- upgrade selection
- station ambience
- boss cue

Background music dapat menggunakan original/generated/royalty-free material yang aman digunakan.

---

# 22. Game States

Minimum states:

```text
MAIN_MENU
↓
PLAYING
↓
UPGRADE
↓
PLAYING
↓
STATION
↓
PLAYING
↓
BOSS
↓
VICTORY

Alternative:
PLAYING → GAME_OVER
```

Pause harus dapat terjadi selama gameplay.

---

# 23. Difficulty Progression

Difficulty meningkat berdasarkan perjalanan.

Target:

### Early

Enemy sedikit dan lambat.

Player memahami controls.

### Mid

Enemy lebih banyak.

Fast enemy mulai muncul.

Train mulai menerima pressure.

### Late

Kombinasi enemy semakin berbahaya.

Heavy enemy muncul lebih sering.

### Boss

Player harus menggunakan upgrade yang diperoleh sepanjang run.

Tidak diperlukan selectable difficulty untuk V1.

---

# 24. Game Over

Game Over terjadi jika:

**Locomotive HP = 0**

atau

**Player HP = 0**

Result screen minimal menampilkan:

- Distance/progress reached
- Enemies defeated
- Scrap collected
- Survivors rescued
- Run duration

Player dapat:

**Retry**

atau

**Return to Main Menu**

---

# 25. Victory

Player menang jika:

1. melewati ketiga biome,
2. mengalahkan final boss,
3. kereta masih berfungsi,
4. mencapai destination.

Victory screen harus menampilkan:

- Run Time
- Enemies Defeated
- Survivors Saved
- Train Condition
- Scrap Collected

Tujuan emosionalnya adalah memberikan rasa:

**"We made it home."**

---

# 26. Technical Requirements

Untuk prototype, prioritaskan teknologi web yang sederhana.

Recommended:

- HTML5
- JavaScript / TypeScript
- Canvas/WebGL game framework bila memang membantu

Agent boleh memilih framework game ringan seperti Phaser apabila memberikan keuntungan implementasi yang jelas.

Hindari backend jika tidak dibutuhkan.

Game harus:

- dapat dijalankan lokal
- dapat dimainkan melalui browser desktop
- tidak membutuhkan API eksternal saat runtime untuk core gameplay
- memiliki struktur source code yang maintainable

Asset harus disimpan lokal dalam project.

---

# 27. Asset Strategy

Development dibagi menjadi dua fase.

## Phase 1 — Gameplay Prototype

Gunakan placeholder:

- simple shapes
- temporary sprites
- basic UI

Tujuannya memvalidasi gameplay.

## Phase 2 — Art Integration

Setelah gameplay stabil, placeholder diganti dengan original assets.

Asset dapat dibuat menggunakan image generation tools yang tersedia.

Semua generated assets harus mengikuti `art-direction.md`.

Jangan menggunakan copyrighted game assets dari game lain.

---

# 28. Prototype Acceptance Criteria

Prototype dianggap berhasil apabila:

- Game dapat dibuka di browser.
- Player dapat bergerak.
- Player dapat aim dan attack.
- Enemy dapat spawn.
- Enemy dapat mengejar target.
- Enemy dapat menerima damage dan mati.
- Enemy dapat menyerang player atau train.
- Train memiliki HP.
- Scrap dapat dijatuhkan dan dikumpulkan.
- Upgrade selection bekerja.
- Minimal tiga enemy archetypes tersedia.
- Minimal satu station encounter tersedia.
- Survivor dapat memberikan passive bonus.
- Difficulty meningkat sepanjang perjalanan.
- Final boss dapat muncul.
- Game dapat berakhir dengan Victory.
- Game dapat berakhir dengan Game Over.
- Game dapat di-restart tanpa refresh browser.

---

# 29. V1 Acceptance Criteria

V1 dianggap selesai apabila seluruh prototype criteria terpenuhi ditambah:

- 3 biome dapat dimainkan.
- 2 station stops tersedia.
- 4 train sections berfungsi.
- 4 survivor archetypes tersedia.
- Final boss memiliki minimal dua behavior.
- Placeholder visual utama telah diganti.
- Visual mengikuti art direction.
- Audio feedback dasar tersedia.
- UI utama telah dipoles.
- Full run dapat diselesaikan dalam sekitar 10–15 menit.
- Tidak terdapat game-breaking bug yang diketahui.

---

# 30. Explicitly Out of Scope

V1 **tidak** mencakup:

- multiplayer
- online account
- leaderboard
- backend
- microtransactions
- procedural world generation kompleks
- open world
- crafting system kompleks
- inventory management kompleks
- dialogue tree
- relationship system
- multiple playable characters
- multiple train routes
- persistent meta progression
- cloud save
- mobile optimization
- controller support
- achievements

Jangan menambahkan fitur tersebut selama prototype/V1 kecuali scope direvisi secara eksplisit.

---

# 31. Future Possibilities

Jika prototype berhasil, kemungkinan pengembangan berikutnya:

- Multiple routes
- Additional regions/biomes
- More train cars
- Character classes
- More survivors
- Random journey events
- More bosses
- Weather
- Day/night transition
- Train customization
- Endless mode
- Persistent progression
- Mobile support
- Leaderboard

Bagian ini bukan requirement V1.

---

# 32. Success Criteria for the Luna Experiment

Selain kualitas game, proyek ini digunakan untuk mengevaluasi kemampuan coding agent.

Catat selama development:

- Jumlah prompt/intervensi manusia.
- Jumlah bug signifikan.
- Kemampuan agent memahami PRD.
- Kemampuan menjaga scope.
- Kualitas architecture.
- Kualitas gameplay yang dihasilkan.
- Kualitas generated assets.
- Konsistensi visual.
- Kemampuan mengintegrasikan asset.
- Kemampuan melakukan debugging.
- Kemampuan melakukan polish tanpa merusak gameplay.

Eksperimen dianggap sangat berhasil apabila agent mampu menghasilkan game yang genuinely playable dengan intervensi manusia yang relatif kecil.

---

# 33. Development Priority

Jika terdapat konflik selama development, gunakan urutan prioritas berikut:

**1. Playability**  
**2. Core gameplay loop**  
**3. Stability**  
**4. Game feel**  
**5. Visual clarity**  
**6. Art polish**  
**7. Additional content**

Game kecil yang menyenangkan lebih baik daripada game besar yang tidak selesai.

---

# 34. Definition of Done

Lintas Malam V1 dianggap selesai ketika seorang pemain baru dapat:

**Open Game → Understand Controls → Defend Train → Collect Scrap → Choose Upgrades → Reach Stations → Rescue Survivors → Cross Three Biomes → Fight Boss → Reach Destination**

tanpa membutuhkan penjelasan dari developer.