# Pixel Chomp – Full Game Architecture Blueprint

## Purpose
This blueprint defines the high-level architecture for **Pixel Chomp**, including systems, scenes, data flow, entity behavior, audio, scoring, and future scalability.

---

## Core Product Vision
Pixel Chomp should be:
- Fast to start
- Easy to understand
- Hard to master
- Lightweight
- Responsive
- Nostalgic but original

---

## MVP Feature Set

### Required systems
- Main menu
- Start game
- Tile-based maze
- Pellet and power pellet system
- Player movement
- Four ghosts with distinct AI
- Scoring
- Lives
- Level progression
- Sound system
- Game over / restart

### Nice-to-have later
- Pause menu
- Settings
- Controller support
- Touch controls
- Multiple maze themes
- Bonus fruits
- Leaderboard
- Endless mode

---

## Recommended Tech Stack

### Best web/mobile-friendly options
- **Phaser + TypeScript**
- **Capacitor** for phone packaging if needed
- **Electron** for desktop build later

### Alternate engines
- Unity
- Godot
- HTML5 Canvas

For your current project style, **Phaser + TypeScript** is the cleanest fit.

---

## Folder Structure

```text
PixelChomp/
  assets/
    audio/
    sprites/
    tiles/
    ui/
  src/
    scenes/
    systems/
    entities/
    data/
    utils/
    types/
  docs/
  package.json
  tsconfig.json
```

---

## Source Structure Details

### `src/scenes/`
Contains game states / screens
- `BootScene.ts`
- `PreloadScene.ts`
- `MenuScene.ts`
- `GameScene.ts`
- `GameOverScene.ts`

### `src/entities/`
Core actors
- `Player.ts`
- `Ghost.ts`
- `GhostManager.ts`
- `Fruit.ts`

### `src/systems/`
Game systems
- `MazeSystem.ts`
- `PelletSystem.ts`
- `ScoreSystem.ts`
- `LifeSystem.ts`
- `SoundSystem.ts`
- `InputSystem.ts`
- `LevelSystem.ts`

### `src/data/`
Static data and tuning
- `mazeLayout.ts`
- `ghostConfig.ts`
- `levelConfig.ts`
- `audioConfig.ts`

### `src/utils/`
Shared helpers
- path helpers
- tile math
- interpolation
- collision helpers

---

## Scene Flow

```text
BootScene
  -> PreloadScene
  -> MenuScene
  -> GameScene
  -> GameOverScene
  -> MenuScene
```

### Scene responsibilities

#### BootScene
- Initialize engine basics
- Set scaling mode
- Prepare config

#### PreloadScene
- Load sprites
- Load audio
- Load tile data
- Show loading bar if desired

#### MenuScene
- Logo
- Start button
- Optional settings button

#### GameScene
- Main gameplay loop
- Update player
- Update ghosts
- Track pellets
- Trigger sounds
- Handle collisions
- Check win/loss states

#### GameOverScene
- Show score
- Restart or return to menu

---

## Core Systems Overview

| System | Responsibility |
|---|---|
| MazeSystem | Loads and manages map tiles |
| PlayerSystem | Handles movement and player state |
| GhostManager | Updates enemy AI and state |
| PelletSystem | Tracks pellets, power pellets, win state |
| ScoreSystem | Handles score increments and display |
| LifeSystem | Tracks lives, respawns, game over |
| SoundSystem | Handles SFX, music, priority, looping |
| LevelSystem | Increases difficulty per round |
| InputSystem | Keyboard / touch / controller input |

---

## Main Update Loop

```pseudo
update():
    inputSystem.update()
    player.update()
    ghostManager.update()
    pelletSystem.update()
    collisionSystem.update()
    scoreSystem.updateUI()
    levelSystem.checkTransitions()
    soundSystem.update()
```

---

## Data Model

### Player
```ts
type PlayerState = {
  x: number
  y: number
  direction: Direction
  requestedDirection: Direction
  speed: number
  lives: number
  score: number
  isAlive: boolean
}
```

### Ghost
```ts
type GhostState = {
  id: string
  x: number
  y: number
  direction: Direction
  mode: "scatter" | "chase" | "frightened" | "eyes" | "spawn"
  speed: number
  targetTile: TileCoord
}
```

### Level
```ts
type LevelState = {
  levelNumber: number
  pelletsRemaining: number
  frightenedDuration: number
  ghostSpeedMultiplier: number
}
```

---

## Collision Architecture

### Required collision types
- Player vs wall
- Ghost vs wall
- Player vs pellet
- Player vs power pellet
- Player vs fruit
- Player vs ghost

Use:
- tile collision for walls
- overlap detection for entities

---

## Input Architecture

### Keyboard
- Arrow keys
- WASD optional

### Mobile
- Swipe controls
- On-screen d-pad optional

Recommended rule:
- input stores **requested direction**
- actual turn occurs only when tile center allows it

```pseudo
if player.centeredOnTile() and requestedDirectionIsValid():
    player.direction = requestedDirection
```

---

## Sound Architecture
Use the sound blueprint already created.

Key requirements:
- alternating pellet tones
- frightened loop
- priority overrides
- death sound interrupts all

---

## Score Architecture

### Base values
| Event | Points |
|---|---:|
| Pellet | 10 |
| Power pellet | 50 |
| 1st ghost | 200 |
| 2nd ghost | 400 |
| 3rd ghost | 800 |
| 4th ghost | 1600 |
| Fruit | configurable |

### Score responsibilities
- add points
- track high score
- update UI
- award extra life if desired

---

## Life / Respawn Architecture

When player dies:
1. Stop movement
2. Play death sound
3. Run death animation
4. Subtract one life
5. If lives > 0: respawn entities
6. Else: transition to Game Over

---

## Level Progression

When pellets reach zero:
1. Play victory sound
2. Increase level number
3. Reset maze pellets
4. Reset entity spawns
5. Apply difficulty modifiers

### Difficulty scaling
- lower frightened duration
- slightly higher ghost speed
- faster release timing
- more aggressive final chase

---

## UI Architecture

### HUD elements
- Score
- High score
- Lives
- Level number

### Screens
- Title screen
- Pause overlay
- Game over screen

For mobile, keep HUD minimal and large enough to read.

---

## Save / Persistence Options

### MVP
Local-only save:
- high score
- settings
- audio volume

### Future
- cloud save
- leaderboard
- achievements

---

## Testing Plan

### Must test
- turns at intersections
- tunnel wrap
- pellet count depletion
- frightened mode timing
- ghost state transitions
- respawn correctness
- level transition reset
- mobile input responsiveness

### Regression checklist
- no wall clipping
- no double-eat collisions
- no stuck ghosts
- no unreachable pellets
- no audio stacking bugs

---

## Codex / AI Build Plan

### Suggested implementation order
1. Engine bootstrap
2. Maze loading and rendering
3. Player movement
4. Pellet system
5. Ghost base movement
6. Ghost AI modes
7. Collision handling
8. Scoring and lives
9. Sound system
10. Menus and polish

---

## Suggested Starter File List

```text
src/scenes/BootScene.ts
src/scenes/PreloadScene.ts
src/scenes/MenuScene.ts
src/scenes/GameScene.ts
src/scenes/GameOverScene.ts

src/entities/Player.ts
src/entities/Ghost.ts
src/entities/GhostManager.ts

src/systems/MazeSystem.ts
src/systems/PelletSystem.ts
src/systems/ScoreSystem.ts
src/systems/LifeSystem.ts
src/systems/SoundSystem.ts
src/systems/LevelSystem.ts
src/systems/InputSystem.ts

src/data/mazeLayout.ts
src/data/ghostConfig.ts
src/data/levelConfig.ts
```

---

## Milestone Plan

### Milestone 1
- Player moves in maze
- pellets load and can be eaten

### Milestone 2
- one ghost with chase logic
- scoring system works

### Milestone 3
- full four ghost behavior
- frightened mode works
- lives and death work

### Milestone 4
- menus
- level progression
- mobile controls
- polish

---

## Final Goal
Pixel Chomp should ship as a:
- clean
- responsive
- mobile-friendly
- retro arcade game
with a strong foundation for future expansion.
