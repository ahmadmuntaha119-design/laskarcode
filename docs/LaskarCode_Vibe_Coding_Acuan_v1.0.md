# LaskarCode — Dokumen Acuan Vibe Coding v1.0

> **Status:** LOCKED
> **Project:** LaskarCode
> **Competition:** M-One Telkomsel Coding Competition
> **Theme:** Web Education for Kids — SD based on AI
> **Tagline:** “Petualangan kecil untuk melatih cara berpikir besar.”
> **Mascot:** Boti
> **AI Tutor:** Kawan Kod
> **AI Story Narrator:** Boti Story
> **Target:** Anak SD kelas 1–6, sekitar usia 7–12 tahun
> **MVP Target:** 2 pulau × 6 level = 12 level
> **Deadline Kompetisi:** 15 October
> **Document Version:** 1.0

---

# 01. PROJECT OVERVIEW

## 1.1 Deskripsi

LaskarCode adalah platform edukasi coding berbasis web untuk anak SD yang mengajarkan **cara berpikir komputasional** melalui permainan, puzzle, visual programming, dan bantuan AI yang bersifat pedagogis.

LaskarCode tidak dirancang sebagai LMS sekolah biasa. Produk harus terasa seperti **petualangan/game edukasi**, sementara konsep coding diperkenalkan secara bertahap melalui pengalaman bermain.

Core learning loop:

```text
Explore
  ↓
Understand
  ↓
Build
  ↓
Run
  ↓
Mistake
  ↓
Think
  ↓
Fix
  ↓
Success
  ↓
Create Story
```

---

## 1.2 Core Value

Nilai utama LaskarCode:

1. Anak belajar coding melalui pengalaman, bukan hafalan.
2. Kesalahan diperlakukan sebagai bagian dari proses belajar.
3. Difficulty beradaptasi berdasarkan kemampuan anak.
4. AI membantu anak berpikir, bukan memberikan jawaban mentah.
5. Game engine tetap deterministic dan tidak bergantung pada AI.
6. Produk sederhana secara teknologi tetapi kuat secara experience.

---

## 1.3 WOW Moment

Momen utama yang harus terasa kuat saat demo:

```text
Anak menulis/memperbaiki program
        ↓
Boti menjalankan program
        ↓
Boti melakukan kesalahan
        ↓
Game Engine mendeteksi fakta kesalahan
        ↓
Kawan Kod memberi Socratic Hint
        ↓
Anak memperbaiki program
        ↓
Boti berhasil
        ↓
Boti Story membuat cerita singkat
```

---

# 02. PRODUCT VISION

## 2.1 Vision

Membuat pengalaman belajar coding pertama yang terasa seperti petualangan, sehingga anak tidak hanya belajar menjalankan instruksi, tetapi mulai belajar:

* sequencing
* direction
* planning
* debugging
* pattern
* algorithm
* problem solving
* efficiency

---

## 2.2 Product Principles

### Principle 1 — Game First, LMS Second

UI harus terasa seperti game edukasi, bukan dashboard sekolah.

### Principle 2 — Thinking Over Answer

Anak harus diberi kesempatan berpikir sebelum mendapatkan petunjuk yang lebih spesifik.

### Principle 3 — Correctness Over Optimization

Solusi yang benar tetap dianggap benar walaupun belum efisien.

### Principle 4 — Adapt, Never Punish

Adaptive learning mengubah kesulitan dan bantuan, bukan menghukum anak.

### Principle 5 — AI as Teacher

AI adalah mentor/storyteller, bukan game engine.

### Principle 6 — Deterministic Core

Core gameplay dan adaptive engine harus deterministic.

### Principle 7 — Collect Less, Expose Less, Trust Less

Jangan mengumpulkan data anak yang tidak diperlukan.

---

# 03. TARGET USER

## 3.1 Primary User

Anak SD kelas 1–6 dengan rentang usia sekitar 7–12 tahun.

Kemampuan awal dapat berbeda:

* belum pernah coding
* pernah menggunakan block programming
* sudah memahami sequencing sederhana
* memiliki pengalaman bermain puzzle logic

---

## 3.2 Adaptive Strategy

Tidak membuat dunia berbeda berdasarkan kelas.

Semua anak berada di dunia/story yang sama, tetapi tingkat kesulitannya dapat disesuaikan.

Contoh dimensi difficulty:

* grid size
* obstacle count
* path complexity
* available blocks
* max actions
* branching
* pattern complexity

---

## 3.3 Child-Facing Language

Bahasa harus sederhana.

Urutan pengenalan istilah:

```text
Bahasa anak
    ↓
Istilah block
    ↓
Konsep formal
```

Contoh:

```text
“Maju”
  ↓
MOVE
  ↓
Instruction
```

Vocabulary MVP:

| Konsep      | Bahasa Anak               | Block                  |
| ----------- | ------------------------- | ---------------------- |
| Instruction | Maju                      | MOVE                   |
| Direction   | Belok kiri/kanan          | TURN_LEFT / TURN_RIGHT |
| Sequence    | Urutan langkah            | Sequence               |
| Loop        | Ulangi                    | LOOP                   |
| Condition   | Jika                      | IF                     |
| Alternative | Jika tidak                | ELSE                   |
| Algorithm   | Langkah teratur           | Algorithm              |
| Debugging   | Cari & perbaiki kesalahan | DEBUG                  |

LOOP, IF, dan ELSE belum menjadi bagian dari MVP Pulau 1–2. LOOP ditunda ke pulau berikutnya.

---

# 04. PRODUCT FLOW

Flow utama:

```text
Landing
   ↓
Create Profile
   ↓
Boti Challenge
   ↓
Adventure Map
   ↓
Island
   ↓
Level
   ↓
Gameplay
   ↓
Result
   ↓
Boti Story
   ↓
Next Level
```

---

## 4.1 Landing

Elemen:

* LaskarCode logo/name
* tagline
* visual Boti
* primary CTA: “🚀 Mulai Petualangan”

Tidak boleh terasa seperti halaman login enterprise.

---

## 4.2 Create Profile

Input:

* nickname
* avatar

Tidak meminta:

* email
* password
* nama lengkap
* sekolah
* nomor telepon
* NIS/NISN
* tanggal lahir
* alamat
* foto wajah
* lokasi

Nickname adalah untrusted input.

Rekomendasi validasi:

* 2–20 karakter
* sanitization
* render sebagai text, bukan unsafe HTML

---

## 4.3 Boti Challenge

Boti Challenge adalah placement/adaptive onboarding.

Jangan menyebutnya “tes”.

Tujuan:

* memahami kemampuan awal
* merekomendasikan difficulty awal
* tidak memberi label “lemah/pintar”

Anak tetap dapat memulai dari awal.

Jumlah mini challenge:

* 3–5 challenge

Konsep yang dapat diukur:

* Sequence
* Direction
* Planning
* Debugging
* Pattern / Problem Solving

---

# 05. GAMEPLAY UX

## 5.1 Desktop

Rasio kasar:

```text
Game Area   ≈ 40%
Coding Area ≈ 60%
```

Gameplay:

```text
┌──────────────────────┬─────────────────────────────┐
│                      │                             │
│      GAME BOARD      │       BLOCKLY AREA          │
│                      │                             │
│       Boti           │   blocks / workspace        │
│       Goal           │                             │
│       Obstacles      │                             │
│                      │                             │
└──────────────────────┴─────────────────────────────┘
```

---

## 5.2 Mobile

Urutan prioritas:

```text
Game
 ↓
Code
 ↓
Feedback
 ↓
Run
```

UI harus tetap usable pada layar kecil.

---

## 5.3 Visual Style

Gunakan:

* 2D flat / modern isometric ringan
* clean
* friendly
* colorful tetapi terkontrol
* soft rounded UI
* game-like

Hindari:

* realistic 3D
* neon berlebihan
* UI enterprise
* dashboard LMS yang padat

---

# 06. RESPONSIVE & ACCESSIBILITY

Breakpoints:

* `<640px` → mobile
* `640–767px` → large mobile
* `768–1023px` → tablet
* `1024–1279px` → small laptop
* `1280px+` → desktop

Touch targets:

* minimum 48×48px
* icon buttons minimum 44px
* level nodes minimum 48px

Animation:

* micro: 150–200ms
* normal: 200–300ms
* celebration: 400–800ms

Accessibility:

* jangan mengandalkan warna saja
* gunakan icon + text
* high contrast
* large readable typography
* audio opsional, tidak boleh wajib

---

# 07. BOTI STATES

Boti memiliki state:

```text
IDLE
THINKING
RUNNING
HAPPY
CONFUSED
COLLISION
SUCCESS
CELEBRATING
```

Boti digunakan di:

* onboarding
* missions
* hints
* success
* story

Boti bukan sekadar dekorasi. Ia menjadi companion yang menjaga continuity pengalaman.

---

# 08. CURRICULUM MVP

# Pulau 1 — Desa Boti

Focus:

* Instruction
* Sequence
* Direction
* Debugging
* Problem Solving

---

## 1.1 — Boti Mau Maju

Type: Learn

Concept:

* Instruction / MOVE

Config:

* grid 5×3
* Boti: `(0,1)`
* Direction: `EAST`
* Goal: `(4,1)`
* hanya MOVE
* goal menghentikan execution
* extra blocks setelah goal tidak dihukum
* 1 star
* tidak ada AI

---

## 1.2 — Jalan Menuju Apel

Type: Learn

Concept:

* Sequence

Config:

* path sederhana
* 4 MOVE optimal
* efficiency dicatat tetapi bukan win condition
* Kawan Kod hanya on-demand

Konsep formal “Sequence” diperkenalkan setelah anak mengalami urutan langkah.

---

## 1.3 — Belok, Boti!

Type: Learn

Concept:

* Direction
* TURN

Direction:

```text
NORTH
EAST
SOUTH
WEST
```

Rotasi:

```text
TURN_RIGHT:
N → E → S → W → N

TURN_LEFT:
N → W → S → E → N
```

TURN tidak memindahkan posisi.

MOVE bergerak sesuai direction saat ini.

Obstacle/boundary diperkenalkan.

Engine error events dapat berupa:

```text
MISSING_TURN
WRONG_DIRECTION
WRONG_ORDER
OBSTACLE_COLLISION
BOUNDARY_COLLISION
```

---

## 1.4 — Jalan Desa

Type: Practice

Concept:

* Sequence
* Direction
* Planning

Contoh config:

```json
{
  "grid": {"width": 5, "height": 3},
  "start": {"x": 0, "y": 0, "direction": "EAST"},
  "goal": {"x": 4, "y": 2},
  "obstacles": [
    {"x": 2, "y": 0},
    {"x": 0, "y": 1},
    {"x": 2, "y": 1},
    {"x": 4, "y": 1}
  ],
  "availableBlocks": [
    "MOVE",
    "TURN_LEFT",
    "TURN_RIGHT"
  ],
  "maxActions": 12
}
```

Auto-trigger Kawan Kod setelah 3 failures.

Track:

* attempts
* collisions
* hints
* program_changes

---

## 1.5 — Perbaiki Jalan Boti

Type: Debugging

Concept:

* Debugging
* Direction
* Sequence

Existing program berisi kesalahan.

Possible bugs:

* wrong direction
* missing MOVE
* wrong order
* extra MOVE

Anak dapat:

* delete block
* move block
* replace block

Engine menghasilkan factual event.

Error Analyzer menginterpretasikan menjadi:

* errorType
* errorBlockIndex

Hint progression:

### Hint 1 — Observation

> “Perhatikan arah Boti setelah berbelok.”

### Hint 2 — Reasoning

> “Setelah Boti bergerak tiga langkah, Boti perlu menuju ke bawah. Apakah arah beloknya sudah benar?”

### Hint 3 — Specific guidance

> “Coba periksa block TURN.”

Track:

* attempts
* hintsUsed
* programBefore
* programAfter
* errorType
* errorBlockIndex
* timeToFix
* successful

---

## 1.6 — Tantangan Kepala Boti

Type: Mastery Check

Bukan exam.

Main challenge:

* blank workspace
* integrasi konsep

Mengukur:

* Sequence
* Direction
* Planning
* Debugging
* independence

Internal status:

```text
Ready
Developing
Needs Reinforcement
```

Routing:

```text
Ready
  → Pulau 2 normal

Developing
  → Pulau 2 easier/adaptive

Needs Reinforcement
  → Micro Challenge
  → Pulau 2
```

Jangan membuat anak merasa gagal atau terjebak.

---

# Pulau 2 — Hutan Pola

Focus:

* Pattern
* Algorithm
* Efficiency
* Debugging
* Problem Solving

---

## 2.1 — Ikuti Polanya

Pattern route contoh:

```text
→ → ↓ → → ↓ → →
```

Konsep:

* Pattern
* Algorithm

---

## 2.2 — Jalan yang Hilang

Contoh:

```text
→ → ↓ → → ? → → ↓
```

Anak memprediksi langkah yang hilang.

Concept:

* Pattern
* Prediction

---

## 2.3 — Urutkan Instruksi

Existing blocks dalam kondisi shuffled.

Anak harus menyusun:

```text
Algorithm
+
Sequence
```

---

## 2.4 — Dua Jalan

Terdapat dua route valid.

Satu lebih pendek.

Keduanya benar.

Efficiency diperkenalkan tetapi tidak menjadi syarat kemenangan.

---

## 2.5 — Perbaiki Algoritma

Debugging strategi/pattern, bukan sekadar satu block salah.

Kawan Kod memancing anak melihat pola ketika Boti menyimpang dari pattern.

---

## 2.6 — Master Challenge

Integrasi:

* Pattern
* Algorithm
* Sequence
* Direction
* Debugging
* Problem Solving

---

# 09. GAME ENGINE SPECIFICATION

## 9.1 Source of Truth

Game Engine adalah sumber kebenaran gameplay.

Tidak boleh digantikan oleh:

* React
* Canvas
* Blockly UI
* AI

---

## 9.2 Coordinate System

```text
x → kanan
y → bawah
```

Type:

```ts
type Position = {
  x: number
  y: number
}
```

---

## 9.3 Direction

```ts
type Direction =
  | "NORTH"
  | "EAST"
  | "SOUTH"
  | "WEST"
```

---

## 9.4 Boti State

```ts
type BotiState = {
  position: Position
  direction: Direction
}
```

---

## 9.5 MOVE

MOVE:

* maju 1 tile
* mengikuti current direction

---

## 9.6 TURN

TURN:

* mengubah direction
* tidak mengubah position

---

## 9.7 Collision

### Obstacle

Jika Boti menabrak obstacle:

* posisi tidak berubah
* engine emit `OBSTACLE_COLLISION`

### Boundary

Jika Boti keluar grid:

* posisi tidak berubah
* engine emit `BOUNDARY_COLLISION`

---

## 9.8 Goal

Jika Boti mencapai goal:

```text
SUCCESS
```

Execution dihentikan segera.

Block setelah goal:

* tidak dieksekusi
* tidak dihukum

---

## 9.9 MVP Blocks

MVP Pulau 1–2:

```text
MOVE
TURN_LEFT
TURN_RIGHT
```

LOOP ditunda ke pulau berikutnya.

---

## 9.10 Execution

Execution harus block-by-block dengan animation.

State:

```text
IDLE
RUNNING
PAUSED
SUCCESS
FAILED
```

PAUSE bersifat opsional jika implementasi terlalu kompleks.

Controls:

* RUN
* PAUSE
* RESET

RUN:

* mulai dari awal

RESET:

* mengembalikan Boti ke initial state
* mempertahankan Blockly program

---

## 9.11 GameResult

Minimal:

```ts
type GameResult = {
  status: "SUCCESS" | "FAILED"
  completed: boolean
  actionsExecuted: number
  collisions: number
  finalPosition: Position
}
```

---

# 10. GAME ENGINE ARCHITECTURE

Struktur:

```text
src/game/
├── engine/
│   ├── GameEngine.ts
│   ├── movement.ts
│   ├── rotation.ts
│   ├── collision.ts
│   ├── goal.ts
│   └── execution.ts
├── parser/
│   ├── BlocklyParser.ts
│   └── actionTypes.ts
├── analyzer/
│   ├── ErrorAnalyzer.ts
│   └── errorTypes.ts
├── renderer/
│   ├── GameRenderer.ts
│   ├── CanvasRenderer.ts
│   └── animation.ts
└── types/
    ├── game.ts
    ├── level.ts
    └── events.ts
```

---

# 11. BLOCKLY ARCHITECTURE

Flow:

```text
Blockly Workspace
      ↓
BlocklyParser
      ↓
Action[]
      ↓
GameEngine
      ↓
GameResult
```

Blockly bukan game engine.

Blockly hanya menghasilkan program/action sequence.

---

# 12. RENDERER RULE

Canvas hanya merender state.

Flow:

```text
GameEngine
    ↓
BotiState
    ↓
Renderer
    ↓
Canvas
```

Canvas tidak pernah menentukan:

* apakah Boti menang
* posisi sebenarnya
* collision
* direction truth

---

# 13. ERROR ANALYZER

Game Engine memberikan fakta.

Error Analyzer memberikan interpretasi pedagogis.

Contoh:

```text
Engine:
OBSTACLE_COLLISION

↓

Error Analyzer:
WRONG_DIRECTION
```

Standard error types:

```text
OBSTACLE_COLLISION
BOUNDARY_COLLISION
WRONG_DIRECTION
WRONG_ORDER
MISSING_ACTION
UNNECESSARY_ACTION
GOAL_NOT_REACHED
```

Collision types adalah fakta engine.

Interpretasi seperti WRONG_DIRECTION dilakukan oleh analyzer.

---

# 14. ADAPTIVE LEARNING ENGINE

Adaptive learning harus deterministic.

Adaptive learning ≠ AI.

---

## 14.1 Concepts

MVP concepts:

1. Sequence
2. Direction
3. Planning
4. Debugging
5. Pattern
6. Algorithm
7. Problem Solving
8. Efficiency

---

## 14.2 Mastery

Range:

```text
0–100
```

Score per concept.

Evidence dapat mencakup:

* success
* attempts
* hints
* collisions
* program changes
* actions used
* optimal actions
* time

---

## 14.3 Evidence Example

Usulan evidence:

```text
Success         +40
Low attempts    +20
No hint         +15
Low collision   +15
Efficiency      +10
```

Weighted update:

```text
newMastery =
  oldMastery * 0.7
  +
  currentEvidence * 0.3
```

Clamp:

```text
0 ≤ mastery ≤ 100
```

---

## 14.4 Status

```text
0–39   Needs Support
40–69  Developing
70–84  Proficient
85–100 Mastered
```

Child-facing labels:

```text
Sedang berkembang
Makin jago
Sudah dikuasai
```

---

## 14.5 Recent Performance

Gunakan juga performance terbaru.

3 challenge terakhir:

```text
3/3 success → Strong
2/3 success → Stable
1/3 success → Struggling
0/3 success → Strongly Struggling
```

---

## 14.6 Adaptive Actions

```text
KEEP
INCREASE_DIFFICULTY
DECREASE_DIFFICULTY
MICRO_CHALLENGE
```

Priority weak concept:

1. weakest concept
2. most frequently wrong
3. current concept
4. other concepts

---

## 14.7 Streak

Jika 3 strong levels:

* naikkan difficulty sedikit
* jangan menaikkan semua dimensi sekaligus

Jika struggling 2–3 challenge:

* hold
* atau decrease sedikit

Jika strongly struggling:

* Micro Challenge

Micro Challenge:

* 30–90 detik
* fokus satu konsep lemah
* setelah itu kembali ke main level
* bukan punishment

Adaptive system tidak boleh trap child.

---

# 15. DATABASE SPECIFICATION

Technology:

**Supabase PostgreSQL**

Total tables:

**11**

---

## 15.1 profiles

```text
id UUID PK
nickname VARCHAR(20)
avatar_id VARCHAR(50)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 15.2 recovery_codes

```text
id UUID PK
profile_id UUID FK UNIQUE
code_hash TEXT
created_at TIMESTAMPTZ
last_used_at TIMESTAMPTZ NULL
expires_at TIMESTAMPTZ NULL
```

Relationship:

```text
Profile 1:1 Recovery Code
```

---

## 15.3 islands

```text
id UUID PK
slug VARCHAR(50) UNIQUE
name VARCHAR(100)
description TEXT
order_index INTEGER
is_active BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 15.4 levels

```text
id UUID PK
island_id UUID FK
code VARCHAR(20) UNIQUE
title VARCHAR(100)
description TEXT
level_type VARCHAR(30)
order_index INTEGER
difficulty INTEGER
configuration JSONB
is_active BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Example:

```json
{
  "grid": {"width": 5, "height": 3},
  "start": {"x": 0, "y": 0, "direction": "EAST"},
  "goal": {"x": 4, "y": 2},
  "obstacles": [
    {"x": 2, "y": 0},
    {"x": 0, "y": 1},
    {"x": 2, "y": 1},
    {"x": 4, "y": 1}
  ],
  "availableBlocks": [
    "MOVE",
    "TURN_LEFT",
    "TURN_RIGHT"
  ],
  "maxActions": 12
}
```

---

## 15.5 concepts

```text
id UUID PK
slug VARCHAR(50) UNIQUE
name VARCHAR(100)
description TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 15.6 level_concepts

```text
level_id UUID FK
concept_id UUID FK
weight NUMERIC
role VARCHAR(20)

PRIMARY KEY (level_id, concept_id)
```

Constraint:

```text
0 ≤ weight ≤ 1
```

---

## 15.7 level_progress

```text
id UUID PK
profile_id UUID FK
level_id UUID FK
status VARCHAR(20)
stars SMALLINT
best_attempts INTEGER
best_time_ms INTEGER NULL
completed_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Status:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

Unique:

```text
(profile_id, level_id)
```

`locked` dan `available` tidak disimpan karena dihitung.

---

## 15.8 level_attempts

```text
id UUID PK
profile_id UUID FK
level_id UUID FK
attempt_number INTEGER
successful BOOLEAN
actions_used INTEGER
optimal_actions INTEGER NULL
collisions INTEGER
hints_used INTEGER
program_changes INTEGER
time_to_complete_ms INTEGER NULL
error_types JSONB
program_data JSONB
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ NULL
```

---

## 15.9 mastery

```text
id UUID PK
profile_id UUID FK
concept_id UUID FK
score NUMERIC(5,2)
status VARCHAR(20)
evidence_count INTEGER
updated_at TIMESTAMPTZ
```

Unique:

```text
(profile_id, concept_id)
```

Constraint:

```text
0 ≤ score ≤ 100
```

---

## 15.10 learning_events

```text
id UUID PK
profile_id UUID FK
level_id UUID FK NULL
attempt_id UUID FK NULL
event_type VARCHAR(50)
event_data JSONB
created_at TIMESTAMPTZ
```

---

## 15.11 ai_interactions

```text
id UUID PK
profile_id UUID FK
level_id UUID FK NULL
attempt_id UUID FK NULL
type VARCHAR(30)
hint_level SMALLINT NULL
context JSONB
response TEXT
created_at TIMESTAMPTZ
```

Type:

```text
KAWAN_KOD
BOTI_STORY
```

---

# 16. DATABASE RELATIONSHIPS

```text
Island 1:N Level

Level M:N Concept
through level_concepts

Profile 1:N Level Progress
Level 1:N Level Progress

Profile 1:N Level Attempt
Level 1:N Level Attempt

Profile 1:N Mastery
Concept 1:N Mastery

Profile 1:N Learning Event
Level 1:N Learning Event
Attempt 1:N Learning Event

Profile 1:N AI Interaction
Level 1:N AI Interaction
Attempt 1:N AI Interaction

Profile 1:1 Recovery Code
```

FK behavior:

* profile-owned data may cascade on profile deletion
* island → level should restrict delete
* content deletion must not accidentally cascade into child progress

---

# 17. DATABASE INDEXES

Recommended:

```text
level_progress(profile_id, level_id)
level_attempts(profile_id, level_id)
mastery(profile_id, concept_id)
learning_events(profile_id, created_at)
ai_interactions(profile_id, created_at)
levels(island_id, order_index)
```

---

# 18. DATA THAT MUST NOT BE STORED

Do not create tables for:

* current Boti position during runtime
* current Boti direction during runtime
* Canvas state
* current animation frame
* every Blockly drag
* every block movement
* every action/frame
* temporary execution state

Store evidence, not every frame.

---

# 19. SOURCE OF TRUTH MAP

| Concern              | Source of Truth |
| -------------------- | --------------- |
| Boti position        | Game Engine     |
| Boti direction       | Game Engine     |
| Collision            | Game Engine     |
| Goal                 | Game Engine     |
| Program execution    | Game Engine     |
| Error interpretation | Error Analyzer  |
| Mastery              | Adaptive Engine |
| Difficulty           | Adaptive Engine |
| Progress persistence | Supabase        |
| Level configuration  | Supabase        |
| AI Hint              | Kawan Kod       |
| AI Story             | Boti Story      |
| Runtime UI state     | Next.js/Zustand |

---

# 20. RLS & AUTHORIZATION

Child access:

* select own profile
* select own progress
* select own mastery
* select relevant own attempts
* insert own attempts
* insert own learning events

Child must NOT:

* view other profiles
* update mastery directly
* update stars directly
* modify level definitions
* manage concepts/content

Admin:

* manage islands
* manage levels
* manage concepts
* manage level_concepts
* inspect aggregate learning data

Admin auth:

**Supabase Auth**

Child auth:

**Guest Session + Recovery Code**

Browser `profile_id` is not proof of ownership.

---

# 21. GUEST SESSION

Flow Device A:

```text
Create Profile
    ↓
Generate Recovery Code
    ↓
Store Recovery Code Hash
    ↓
Create Guest Session
    ↓
Play
```

Flow Device B:

```text
Enter Recovery Code
    ↓
Rate Limit
    ↓
Hash & Compare
    ↓
Create New Guest Session
    ↓
Load Progress
```

Recovery code format example:

```text
BOTI-7K4P-92
```

Rules:

* hash in DB
* never store plaintext recovery code
* one active code per profile for MVP
* rate limit recovery attempts
* recovery code is not admin credential

Example rate limit:

```text
5 attempts / 10 minutes / IP or session
```

---

# 22. SECURITY PRINCIPLES

Core principle:

> Collect less, expose less, trust less.

---

## 22.1 No Child PII

Do not collect:

* full name
* address
* phone
* email
* school
* NIS/NISN
* DOB
* face photo
* location
* parent contact

---

## 22.2 Client Is Untrusted

Never trust directly:

* profile_id
* stars
* mastery
* progress
* attempt result
* recovery code
* client-calculated score

Server validates and authorizes.

---

## 22.3 Secrets

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
AI_API_KEY
```

Client-safe example:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Server-only:

```text
SUPABASE_SERVICE_ROLE_KEY
AI_API_KEY
```

No secrets in:

* source code
* Git
* screenshots
* logs
* tests
* docs

---

## 22.4 RLS

Supabase RLS is mandatory for production child-owned data.

---

## 22.5 SQL Injection

Use parameterized/query-builder methods.

---

## 22.6 XSS

Nickname and other child data must be rendered as text.

Avoid unsafe HTML rendering.

---

# 23. AI ARCHITECTURE

AI flow:

```text
Client
  ↓
Next.js Server Endpoint / Server Action
  ↓
Validate Session
  ↓
Validate Context
  ↓
Rate Limit
  ↓
AI Provider
  ↓
Validate Output
  ↓
Client
```

---

# 24. KAWAN KOD SPECIFICATION

Kawan Kod:

* friendly
* concise
* Indonesian
* age 7–12
* no shame
* no labels
* does not ask for personal information
* no full solution
* no unrelated topic
* no external platform redirection
* does not disclose system prompts
* does not disclose credentials
* not a general chatbot

---

## 24.1 Hint Levels

### Hint 1

Observation.

Example:

> “Perhatikan arah Boti setelah berbelok.”

### Hint 2

Reasoning.

Example:

> “Setelah Boti bergerak tiga langkah, Boti perlu menuju ke bawah. Apakah arah beloknya sudah benar?”

### Hint 3

More specific guidance.

Example:

> “Coba periksa block TURN.”

Do not reveal the complete solution.

---

## 24.2 AI Output Schema

Example:

```json
{
  "message": "Perhatikan arah Boti setelah berbelok.",
  "hintLevel": 1,
  "shouldRevealSolution": false
}
```

Response must be schema-validated.

Invalid response:

```text
AI failure
   ↓
Static fallback
```

---

## 24.3 Rate Limits

Kawan Kod:

```text
~10 requests / 10 minutes / profile
```

Boti Story:

```text
max 1 generation / level completion
```

---

# 25. BOTI STORY

Boti Story hanya berdasarkan gameplay facts.

Contoh context:

```json
{
  "success": true,
  "actionsUsed": 7,
  "collisions": 0,
  "hintsUsed": 1
}
```

AI tidak boleh mengarang fakta gameplay.

Story should celebrate progress and discovery.

---

# 26. AI PRIVACY

AI context tidak boleh berisi:

* nickname
* UUID
* email
* school
* address
* recovery code
* other PII

AI hanya menerima context minimum yang diperlukan untuk pedagogi.

---

# 27. AI SAFETY

Lindungi terhadap prompt injection.

Prinsip:

```text
Trusted System Context
+
Trusted Level Context
+
Sanitized Game Context
```

AI tidak boleh menerima instruksi tak dikenal sebagai system-level authority.

---

# 28. AI FAILURE RULE

Jika AI gagal:

```text
AI unavailable
      ↓
Static fallback
      ↓
Gameplay continues
```

AI tidak boleh menjadi single point of failure untuk gameplay.

---

# 29. PROJECT ARCHITECTURE

Stack locked:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand
* Blockly
* HTML Canvas 2D
* Supabase PostgreSQL
* Supabase Auth for admin
* Guest UUID/session + Recovery Code for child
* AI provider via server-side Next.js
* Vercel + Supabase

No:

* Laravel
* separate backend
* Redis for MVP
* Docker for MVP
* microservices

---

# 30. PROJECT FOLDER STRUCTURE

```text
laskarcode/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── profile/
│   │   ├── challenge/
│   │   ├── adventure/
│   │   ├── play/
│   │   ├── result/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── hint/
│   │   │   │   └── story/
│   │   │   ├── profile/
│   │   │   ├── progress/
│   │   │   └── recovery/
│   │   └── admin/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── boti/
│   │   ├── adventure/
│   │   ├── game/
│   │   ├── coding/
│   │   ├── feedback/
│   │   └── ui/
│   │
│   ├── game/
│   │   ├── engine/
│   │   ├── parser/
│   │   ├── analyzer/
│   │   ├── renderer/
│   │   └── types/
│   │
│   ├── adaptive/
│   │   ├── mastery/
│   │   ├── difficulty/
│   │   └── routing/
│   │
│   ├── services/
│   │   ├── profiles/
│   │   ├── levels/
│   │   ├── progress/
│   │   ├── attempts/
│   │   ├── mastery/
│   │   ├── learning/
│   │   └── ai/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validation/
│   │   ├── security/
│   │   └── utils/
│   │
│   ├── stores/
│   │   ├── gameStore.ts
│   │   ├── profileStore.ts
│   │   └── uiStore.ts
│   │
│   └── types/
│       ├── profile.ts
│       ├── level.ts
│       ├── progress.ts
│       ├── mastery.ts
│       ├── game.ts
│       └── ai.ts
│
├── public/
│   ├── images/
│   ├── avatars/
│   ├── boti/
│   └── sounds/
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│
├── .env.local
├── .env.example
├── package.json
└── README.md
```

---

# 31. SERVER VS CLIENT COMPONENTS

## Server Component by default

Gunakan untuk:

* load level
* load progress
* load configuration
* server-side authorization
* page rendering
* safe database access

## Client Component

Gunakan ketika membutuhkan:

* Blockly
* Canvas
* Zustand
* animation
* event handlers
* browser APIs
* highly interactive UI

Jangan menjadikan seluruh aplikasi:

```text
"use client"
```

---

# 32. STATE MANAGEMENT

Zustand digunakan untuk runtime/client state.

Contoh:

```ts
{
  executionState: "IDLE",
  currentStep: 0,
  botiPosition: {
    x: 0,
    y: 1
  },
  botiDirection: "EAST",
  currentError: null,
  isHintOpen: false
}
```

Zustand bukan database.

Tidak menjadi source of truth untuk:

* mastery
* completed level
* permanent stars
* attempt history

---

# 33. SERVICE LAYER

UI tidak melakukan database access secara acak.

Pattern:

```text
Component
   ↓
Service
   ↓
Supabase
```

Contoh:

```text
progressService
levelService
attemptService
masteryService
learningService
aiService
```

---

# 34. DATA FLOW GAMEPLAY

```text
Level Config
    ↓
Gameplay Client
    ↓
Blockly
    ↓
BlocklyParser
    ↓
Action[]
    ↓
GameEngine
    ↓
GameResult
    ├── Feedback
    ├── ErrorAnalyzer
    └── Adaptive Engine
           ↓
        Mastery
           ↓
       Difficulty
           ↓
        Progress
           ↓
       Supabase
```

---

# 35. DEPLOYMENT ARCHITECTURE

Production:

```text
Browser
   ↓
Vercel
   ↓
Next.js
   ├── UI
   ├── Game Engine
   ├── Services
   └── AI API Routes
          ├── Supabase
          └── AI Provider
```

---

# 36. ENVIRONMENTS

Logical environments:

```text
Development
    ↓
Preview
    ↓
Production
```

Development:

```text
localhost:3000
```

Preview:

* Vercel Preview

Production:

* Vercel Production

---

# 37. ENVIRONMENT VARIABLES

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
AI_API_KEY=
```

Only public-safe variables may use `NEXT_PUBLIC_`.

---

# 38. DATABASE MIGRATIONS

Use:

```text
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    ├── 003_seed_islands.sql
    └── ...
```

Do not rely on undocumented manual schema changes.

---

# 39. SEED DATA

Level content should be data-driven.

Seed:

* islands
* levels
* concepts
* level_concepts

Do not hardcode every level inside React components.

Avoid:

```ts
if (level === "1.3") {
   ...
}
```

spread across UI code.

---

# 40. GIT STRATEGY

Branches:

```text
main
feature/*
fix/*
```

`main` should remain runnable.

Do not overcomplicate with Git Flow.

---

# 41. DEPENDENCY RULE

Before installing a dependency, ask:

1. Is it necessary?
2. Is there already an existing dependency that solves it?
3. Does it materially simplify the implementation?
4. Does it add maintenance/security cost?

Prefer fewer dependencies for MVP.

---

# 42. VIBE CODING RULES

## 42.1 Core Protocol

Every task:

```text
Understand
   ↓
Plan
   ↓
Implement
   ↓
Test
   ↓
Verify
```

---

## 42.2 Before Editing

Agent should inspect:

* relevant files
* architecture
* related modules
* types
* tests
* constraints

Do not generate code blindly.

---

## 42.3 Minimal Blast Radius

Make the smallest change needed.

Do not modify unrelated modules.

---

## 42.4 No Unnecessary Refactor

Do not refactor working code merely because another style is preferred.

Refactor only when it:

* supports the feature
* fixes a bug
* reduces coupling
* improves security
* materially improves maintainability

---

## 42.5 No Architecture Drift

Never introduce:

* Laravel
* separate backend
* Redis
* microservices
* Docker-based complexity

without a new explicit architecture decision.

---

# 43. TYPESCRIPT RULES

Use TypeScript strict.

Avoid `any`.

Prefer:

```text
unknown
```

with schema validation when data is untrusted.

Important external boundaries:

* API payload
* Supabase result
* AI output
* level config
* Blockly data
* recovery input

must be validated.

Recommended validation approach:

```text
Unknown Data
    ↓
Schema Validation
    ↓
Trusted Typed Data
```

Zod is the preferred schema-validation library if added to the project.

---

# 44. COMPONENT RULES

One primary responsibility per component.

Bad:

```text
BotiBubble
  ├── Database query
  ├── AI call
  ├── Mastery calculation
  ├── Progress mutation
  └── UI
```

Good:

```text
BotiBubble
  └── Render bubble

aiService
  └── AI request

masteryService
  └── Mastery persistence
```

---

# 45. PAGE RULES

`page.tsx` must not become an application monolith.

Avoid:

```text
page.tsx
 ├── database
 ├── AI
 ├── game logic
 ├── adaptive
 ├── validation
 └── UI
```

Prefer orchestration through:

* services
* domain modules
* client components
* validation modules

---

# 46. ERROR HANDLING

Never expose raw technical error details to child users.

Bad:

```text
PostgrestError: 23505 duplicate key...
```

Good:

```text
“Ups, ada sedikit masalah. Coba lagi.”
```

Server logs may contain technical details but must not contain secrets or child PII.

---

# 47. TESTING STRATEGY

Four testing layers:

```text
Functional
Learning
UX
Technical
```

---

## 47.1 Unit Tests

Test:

* movement
* rotation
* collision
* goal
* parser
* mastery calculation
* difficulty adjustment

---

## 47.2 Integration Tests

At minimum:

```text
Blockly
  ↓
Parser
  ↓
Game Engine
  ↓
Game Result
  ↓
Adaptive Engine
```

---

## 47.3 E2E

Main flow:

```text
Create Profile
   ↓
Boti Challenge
   ↓
Adventure Map
   ↓
Level
   ↓
Blockly
   ↓
Run
   ↓
Success
   ↓
Story
   ↓
Next Level
```

---

## 47.4 Game Engine Acceptance Tests

Must verify:

* MOVE changes position correctly
* TURN_RIGHT cycles correctly
* TURN_LEFT cycles correctly
* collision leaves position unchanged
* goal produces SUCCESS
* goal stops execution immediately
* RESET restores initial state
* RESET preserves Blockly program
* parser preserves block order
* parser rejects unavailable blocks

---

## 47.5 Adaptive Tests

Must verify:

* high evidence increases mastery
* low evidence does not incorrectly over-increase mastery
* score remains between 0 and 100
* strong performance can increase difficulty
* struggling performance can hold/decrease difficulty
* micro challenge routing works

---

## 47.6 AI Tests

Must verify:

* Hint 1 is observational
* Hint 2 encourages reasoning
* Hint 3 is more specific without full solution
* invalid AI response triggers fallback
* timeout triggers fallback
* AI context excludes PII
* Boti Story only uses real gameplay facts

---

## 47.7 Privacy Tests

Ensure AI context does not contain:

* nickname
* UUID
* email
* school
* address
* other PII

---

## 47.8 Security Tests

Verify:

* API keys are server-only
* client cannot update mastery directly
* client cannot forge trusted stars
* RLS blocks cross-profile access
* recovery code is rate-limited
* invalid recovery codes are handled safely

---

## 47.9 Responsive Tests

Test at:

```text
390×844
768×1024
1366×768
1920×1080
```

---

# 48. DEFINITION OF DONE — PER LEVEL

A level is not complete until:

* [ ] level configuration exists
* [ ] grid exists
* [ ] start position exists
* [ ] goal exists
* [ ] obstacles exist when applicable
* [ ] available blocks are defined
* [ ] parser supports required blocks
* [ ] Game Engine executes correctly
* [ ] success condition works
* [ ] reset works
* [ ] error feedback works
* [ ] Kawan Kod context exists if needed
* [ ] concepts are linked
* [ ] difficulty is defined
* [ ] progress can be persisted
* [ ] responsive UI works
* [ ] tests pass

---

# 49. MVP DEFINITION OF DONE

MVP is ready only when the critical E2E flow works:

```text
Create Profile
   ↓
Boti Challenge
   ↓
Adventure Map
   ↓
Level 1.1
   ↓
Blockly
   ↓
Run
   ↓
Game Engine
   ↓
Success
   ↓
Progress Saved
   ↓
Next Level
```

and at least one representative debugging/adaptive/AI path works:

```text
Wrong Program
   ↓
Game Error
   ↓
Kawan Kod
   ↓
Fix
   ↓
Success
   ↓
Mastery Update
```

---

# 50. PRIORITY SYSTEM

## P0 — Critical

* Profile
* Game Engine
* Blockly
* Level system
* Progress
* Basic Adaptive Learning
* Kawan Kod
* Adventure flow
* Supabase
* Security

## P1 — Important

* Better animation
* Better feedback
* Boti Story
* Recovery UX
* Responsive refinement

## P2 — Nice to Have

* Sound effects
* Advanced animation
* Extra visual effects
* Additional levels
* Extra customization

When time is limited:

> P0 must work. P2 can be removed.

---

# 51. UI ARCHITECTURE

```text
components/
├── layout/
│   ├── AppShell
│   ├── GameHeader
│   └── BottomActionBar
├── boti/
│   ├── Boti
│   ├── BotiAvatar
│   ├── BotiBubble
│   └── BotiStory
├── adventure/
│   ├── AdventureMap
│   ├── IslandNode
│   ├── LevelNode
│   └── StarRating
├── game/
│   ├── GameBoard
│   ├── Grid
│   ├── Tile
│   ├── BotiCharacter
│   ├── Goal
│   └── Obstacle
├── coding/
│   ├── BlocklyWorkspace
│   ├── BlockPalette
│   └── CodeControls
├── feedback/
│   ├── FeedbackCard
│   ├── HintCard
│   ├── SuccessCard
│   └── CollisionMessage
└── ui/
    ├── Button
    ├── Card
    ├── Badge
    ├── Modal
    ├── ProgressBar
    └── IconButton
```

---

# 52. DESIGN TOKENS

Spacing:

```text
4
8
12
16
20
24
32
40
48
64
```

Radius:

```text
6
8
12
16
20
999
```

Use tokens consistently.

Avoid arbitrary one-off spacing unless needed.

---

# 53. PRIMARY ACTION RULE

One primary action per page whenever practical.

Examples:

Landing:

```text
🚀 Mulai Petualangan
```

Profile:

```text
Lanjutkan
```

Level:

```text
Jalankan
```

Result:

```text
Lanjut ke Level Berikutnya
```

Avoid multiple competing primary CTAs.

---

# 54. UX FEEDBACK RULES

Never shame the child.

Avoid:

* “Kamu salah.”
* “Jawabanmu buruk.”
* “Gagal.”

Prefer:

* “Coba lihat lagi.”
* “Hmm, Boti berhenti di sini.”
* “Ada bagian yang bisa diperbaiki.”
* “Yuk cari tahu kenapa.”

Wrong attempts should feel like learning opportunities.

No harsh lives.

No shaming leaderboard.

No numeric score as primary emotional feedback.

Stars are rewards, not access gates.

---

# 55. EFFICIENCY RULE

Efficiency is secondary to correctness.

For levels such as 2.4:

* multiple valid solutions are accepted
* shorter route may earn stronger reward/evidence
* child is never blocked solely because the solution is not optimal

---

# 56. LEVEL LOCKING RULE

Persist only:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

Compute:

```text
LOCKED
AVAILABLE
```

from:

* previous progress
* routing
* adaptive rules

Do not persist redundant state unless a future requirement proves it necessary.

---

# 57. STAR SYSTEM

Stars are rewards.

They are not hard access gates.

The product should encourage improvement without turning stars into a punishment mechanism.

---

# 58. ADMIN ARCHITECTURE

Admin is separate from child guest flow.

Admin authentication:

```text
Supabase Auth
```

Admin capabilities:

* content management
* island management
* level management
* concept management
* level-concept mapping
* aggregate learning inspection

Child guest session must never grant admin permissions.

---

# 59. DEPLOYMENT RULES

Production deployment:

```text
Git
  ↓
Vercel Preview
  ↓
Typecheck
  ↓
Lint
  ↓
Tests
  ↓
Manual QA
  ↓
main
  ↓
Production
```

Production branch:

```text
main
```

`main` should remain runnable.

---

# 60. CODING AGENT WORKING PROTOCOL

The coding agent must follow this exact working style:

## Step 1 — Understand

Read relevant source files and identify constraints.

## Step 2 — Plan

State:

* what will change
* why
* which files are affected
* dependencies/risks

## Step 3 — Implement

Make minimal focused changes.

## Step 4 — Test

Run relevant:

* typecheck
* lint
* unit tests
* integration tests
* E2E when appropriate

## Step 5 — Verify

Confirm actual behavior, not just compilation.

## Step 6 — Summarize

Report:

* changes made
* tests run
* known limitations
* next dependency, if any

---

# 61. LARGE CHANGE RULE

For changes affecting multiple critical modules, agent must identify blast radius before implementation.

Example:

Changing Game Engine may affect:

* parser
* renderer
* result model
* attempt recording
* adaptive evidence
* AI context
* tests

Do not modify these blindly.

---

# 62. CONFLICT RESOLUTION PRIORITY

When requirements conflict, use this order:

```text
1. Security
2. Core gameplay correctness
3. Learning correctness
4. Data integrity
5. UX
6. Performance
7. Code elegance
8. Nice-to-have
```

Example:

If a visual optimization makes the engine non-deterministic:

> Preserve determinism.

---

# 63. GOLDEN RULE

> **Jangan membuat LaskarCode lebih kompleks daripada yang dibutuhkan untuk membuat pengalaman belajar coding anak menjadi lebih baik.**

Technology serves the learning experience.

Not the other way around.

---

# 64. FINAL ARCHITECTURE SUMMARY

```text
                         LASKARCODE
                              │
              ┌───────────────┴────────────────┐
              │                                │
           Next.js                           Supabase
              │                                │
      ┌───────┼────────┐              ┌────────┴───────┐
      │       │        │              │                │
      ▼       ▼        ▼              ▼                ▼
     UI     Game    Adaptive      PostgreSQL       Supabase Auth
            Engine    Engine
      │       │        │
      │       │        │
      │    Blockly   Mastery
      │    Parser    Difficulty
      │       │        │
      └───────┼────────┘
              │
           Services
              │
         ┌────┴────┐
         ▼         ▼
      Supabase     AI
                    │
              ┌─────┴─────┐
              ▼           ▼
          Kawan Kod    Boti Story
```

---

# 65. LOCKED DECISIONS

## Product

* [x] Product: LaskarCode
* [x] Tagline: “Petualangan kecil untuk melatih cara berpikir besar.”
* [x] Mascot: Boti
* [x] AI Tutor: Kawan Kod
* [x] AI Story: Boti Story
* [x] Target: SD 7–12 tahun
* [x] MVP: 12 levels
* [x] 2 islands × 6 levels
* [x] Adaptive learning
* [x] Game-based coding

## Technology

* [x] Next.js
* [x] TypeScript
* [x] Tailwind CSS
* [x] shadcn/ui
* [x] Zustand
* [x] Blockly
* [x] Canvas 2D
* [x] Supabase PostgreSQL
* [x] Supabase Auth
* [x] Vercel
* [x] Server-side AI integration

## Not in MVP

* [x] No Laravel
* [x] No separate backend
* [x] No Redis
* [x] No Docker
* [x] No microservices
* [x] No 3D game engine

## Security

* [x] RLS
* [x] Server-side secrets
* [x] Hashed recovery codes
* [x] Guest session
* [x] Rate limiting
* [x] AI output validation
* [x] No child PII
* [x] Client is untrusted
* [x] Server validates sensitive state

## Engineering

* [x] Game Engine deterministic
* [x] Adaptive Engine deterministic
* [x] Canvas not source of truth
* [x] Blockly not game engine
* [x] Zustand is runtime state only
* [x] Services mediate persistence/external APIs
* [x] Data-driven level configuration
* [x] Migrations + seed
* [x] Test critical behavior
* [x] Minimal blast radius
* [x] No unnecessary refactors

---

# 66. INSTRUCTION BLOCK FOR CODING AGENT

The following rules are mandatory when implementing LaskarCode:

```text
You are implementing LaskarCode, a child-friendly coding education game.

Treat this document as the project source of truth.

Before changing code:
1. Inspect the relevant files.
2. Understand the existing architecture.
3. Identify constraints and dependencies.
4. Plan the smallest safe change.

Architecture:
- Single Next.js full-stack application.
- TypeScript strict.
- Server Components by default.
- Client Components only when interactivity requires them.
- Supabase PostgreSQL is the persistence layer.
- Supabase Auth is for admin authentication.
- Child users use guest sessions + recovery codes.
- AI requests must go through the server.
- No Laravel, no separate backend, no Redis, no Docker, no microservices for MVP.

Game:
- Game Engine is deterministic and is the source of truth.
- Blockly only produces a program/action sequence.
- Canvas only renders state.
- React must not decide gameplay success.
- AI must not decide gameplay success.
- Goal completion immediately stops execution.
- Collision must not move Boti through an obstacle or boundary.
- Reset restores initial game state but preserves the Blockly program.

Adaptive:
- Adaptive learning is deterministic.
- AI does not calculate mastery.
- Mastery is concept-based.
- Adaptive learning must never trap or shame the child.

AI:
- Kawan Kod is a hint system, not a general chatbot.
- AI should encourage thinking rather than reveal the complete solution.
- AI context must not include child PII.
- Validate AI output.
- Use static fallback when AI fails.
- AI failure must never block gameplay.
- Boti Story must be grounded in actual gameplay facts.

Security:
- Treat all client input as untrusted.
- Never expose service-role keys or AI keys to the client.
- Enforce RLS.
- Never trust profile_id from the browser as proof of authorization.
- Validate and authorize on the server.
- Never log secrets, recovery codes, session tokens, or child PII.

Database:
- Use the locked 11-table schema.
- Do not create runtime-state tables.
- Prefer normalized relational data.
- Use JSONB only for intentionally flexible data.
- Use migrations and seed data.
- Do not hardcode level definitions throughout React components.

Code quality:
- Prefer simple solutions over overengineering.
- Avoid any.
- Validate external/unknown data.
- Keep components focused.
- Keep page.tsx files thin.
- Put persistence/external integrations behind services.
- Do not add dependencies without justification.
- Do not perform unrelated refactors.

Testing:
- Run relevant typecheck/lint/tests after changes.
- Test behavior, not just compilation.
- Critical gameplay and adaptive logic must have tests.
- Verify the real user flow where appropriate.

Priority:
1. Security
2. Gameplay correctness
3. Learning correctness
4. Data integrity
5. UX
6. Performance
7. Code elegance
8. Nice-to-have

MVP principle:
P0 must work before P1/P2 polish.
Do not sacrifice core gameplay for visual complexity.
```

---

# 67. FINAL STATUS

**LaskarCode Vibe Coding Specification v1.0**

Status:

```text
PRODUCT        ✅ LOCKED
CURRICULUM     ✅ LOCKED
GAME ENGINE    ✅ LOCKED
ADAPTIVE       ✅ LOCKED
DATABASE       ✅ LOCKED
AI             ✅ LOCKED
SECURITY       ✅ LOCKED
ARCHITECTURE   ✅ LOCKED
DEPLOYMENT     ✅ LOCKED
VIBE CODING    ✅ LOCKED
TESTING        ✅ LOCKED
MVP SCOPE      ✅ LOCKED
```

This document is the baseline reference for implementation.

Any future change that conflicts with a locked decision must be treated as an explicit architecture/product change and documented before implementation.
