# Pixel Chomp Blueprint

## Project identity
**Name:** Pixel Chomp  
**Genre:** Arcade maze-chase  
**Platform target:** PC web first, then desktop or mobile  
**Core fantasy:** Navigate a maze, clear pellets, outsmart enemies, trigger power mode, and survive escalating rounds.

---

## Vision
Pixel Chomp should feel instantly readable, highly replayable, and skill-based. The player should feel tension from enemy pursuit, relief from power-ups, and satisfaction from route optimization.

The game should not be a direct clone. It should preserve the fun of arcade maze pressure while introducing its own identity through:
- original maze sets
- original enemy cast
- distinct art style
- slightly modernized controls and UX
- optional modifiers and replay hooks

---

## Pillars
1. **Readable arcade action**  
   Movement, pellets, enemies, and hazards must always be visually clear.

2. **Tight control feel**  
   Inputs should buffer cleanly and turning should feel responsive.

3. **Deterministic pressure**  
   Enemy behavior should be rule-driven and learnable.

4. **Fast restart loop**  
   Death should never create too much downtime.

5. **Expandable foundation**  
   The MVP should naturally support bonus modes, new mazes, skins, and challenge variants.

---

## Core gameplay loop
1. Spawn into maze
2. Move through corridors collecting pellets
3. Avoid enemy contact
4. Trigger power pellets to flip the risk/reward state
5. Eat vulnerable enemies for bonus score
6. Clear all pellets to finish the round
7. Enter the next round with increased speed or complexity
8. Lose all lives = game over

---

## Player functionality
### Movement
- Four-direction movement on a tile grid
- Input buffering for the next turn
- Snap turning at valid intersections
- Wrap tunnels optional per maze
- Slight turn forgiveness for responsiveness

### Player states
- Normal
- Powered
- Hit / dying
- Respawning
- Victory transition

### Player variables
- lives
- score
- combo chain during powered state
- current tile
- current direction
- queued direction
- movement speed

---

## Maze systems
### Grid rules
- Tile-based map
- Wall tiles block movement
- Walkable tiles allow traversal
- Junctions are used for direction choice
- Special tunnels may wrap from one side to another

### Tile types
- empty floor
- pellet
- power pellet
- wall
- tunnel
- enemy house / spawn
- bonus spawn tile
- hazard tile (optional advanced mode)

### Round completion
- Round ends when all collectible pellets are cleared

---

## Enemy system
### Design goal
Enemies should feel like personalities, not random movers.

### MVP enemy cast
Use original names for Pixel Chomp enemies, not borrowed identities.

- **Glint** — direct hunter; pressures the player head-on
- **Drift** — predictive ambusher; targets a few tiles ahead of player direction
- **Vector** — uses both player and hunter positions to create weird pressure angles
- **Mope** — alternates between pursuit and retreat depending on proximity

### Enemy states
- Spawn / house
- Scatter
- Chase
- Frightened
- Returning

### AI behavior rules
- Enemies choose turns at intersections only
- Enemies cannot reverse unless state change forces it
- Chase targets are rule-based, not random
- Frightened mode uses randomized or weighted escape logic
- Returning mode heads to spawn quickly after being eaten

---

## Power-up system
### Power pellets
- Larger collectible placed at key maze positions
- Trigger temporary power mode
- Enemies become vulnerable
- Vulnerable enemies flash near expiration
- Eating enemies increases combo score

### Combo scoring
Suggested default:
- 1st enemy: 200
- 2nd enemy: 400
- 3rd enemy: 800
- 4th enemy: 1600

This resets after power mode ends.

---

## Scoring system
### Base scoring
- Small pellet: 10
- Power pellet: 50
- Bonus fruit/item: 100–5000 depending on round or rarity
- Vulnerable enemy combo chain: escalating values
- Round clear bonus: optional
- No-death bonus: optional later feature

### Score UX
- Floating score popups on enemy or bonus collection
- Persistent HUD at top of screen
- Local high score saved between sessions

---

## Bonus item system
- Spawn one or two bonus items per round after pellet thresholds
- Spawn at fixed central tile or moving path
- Despawn after timer expires
- Gives score spike and variety

Possible Pixel Chomp bonus theme ideas:
- battery cell
- pixel berry
- floppy disk
- neon gem
- microchip

---

## Difficulty progression
### MVP progression knobs
- Increase enemy movement speed
- Decrease frightened duration
- Increase enemy release speed
- Add tighter mazes later
- Add more aggressive scatter/chase timings

### Difficulty philosophy
Early rounds should teach. Mid rounds should pressure. Late rounds should demand route mastery.

---

## Controls
### Keyboard
- Arrow keys
- WASD support
- Enter to start
- Escape to pause

### Optional controller support
- D-pad preferred
- Analog can snap to four directions

---

## UI / UX
### Main menu
- Start game
- High scores
- Settings
- Credits

### In-game HUD
- score
- high score
- lives
- round number
- power timer visual cue

### Game over screen
- score
- best score
- restart
- return to menu

### Pause menu
- resume
- restart round
- settings
- quit

---

## Audio direction
- crunchy pellet pickup ticks
- low, rising danger hum
- satisfying power-up sting
- enemy-eaten pop sequence
- game-over sting
- upbeat attract/menu loop

Avoid using iconic borrowed sounds. Build an original sound palette.

---

## Art direction
- clean pixel art
- high contrast maze walls
- strong color separation between enemies
- readable pellets at small scale
- subtle bloom or CRT-style optional post effect
- retro but not muddy

---

## Technical architecture
### Recommended scenes
- BootScene
- PreloadScene
- MainMenuScene
- GameScene
- UIScene
- GameOverScene

### Core systems
- GridManager
- PlayerController
- EnemyController
- EnemyAI
- RoundManager
- ScoreManager
- CollectibleManager
- AudioManager
- SaveManager
- FXManager

### Suggested data files
- `mazes/*.json`
- `config/enemies.ts`
- `config/scoring.ts`
- `config/rounds.ts`
- `config/powerups.ts`

---

## MVP feature checklist
### Must-have
- one maze
- player movement
- pellet collection
- four enemy personalities
- power pellet mode
- score and lives
- round completion
- game over
- restart flow
- sound effects

### Nice-to-have
- multiple mazes
- bonus items
- local leaderboard
- challenge mode
- skin themes
- accessibility settings

---

## Suggested Phaser + TypeScript scaffold
```text
src/
  main.ts
  game/
    config.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MainMenuScene.ts
      GameScene.ts
      UIScene.ts
      GameOverScene.ts
    systems/
      GridManager.ts
      RoundManager.ts
      ScoreManager.ts
      SaveManager.ts
      AudioManager.ts
      FXManager.ts
    entities/
      Player.ts
      Enemy.ts
    ai/
      EnemyBrain.ts
      behaviors.ts
    data/
      mazes/
        maze01.json
      rounds.ts
      scoring.ts
      enemies.ts
      powerups.ts
    ui/
      Hud.ts
      Menus.ts
    utils/
      math.ts
      grid.ts
      input.ts
```

---

## Expansion ideas
- procedural modifier mode
- time attack mode
- endless mode
- roguelite maze perks
- co-op or versus maze mode
- boss enemy rounds
- mobile touch swipe controls

---

## Definition of done for MVP
Pixel Chomp MVP is ready when:
- the game loop is playable start to finish
- player movement feels tight
- enemies are readable and distinct
- one full round system works reliably
- deaths, respawns, and scoring have no major bugs
- the build can be handed to testers without explanation
