# Pixel Chomp Game Dev Skill

## Purpose
This skill guides implementation of Pixel Chomp as an original arcade maze-chase game using Phaser 3 and TypeScript.

## Primary goals
- Build a responsive movement system on a tile grid
- Keep systems modular and testable
- Favor deterministic game logic over overly complex pathfinding
- Preserve arcade feel through clear state machines

## Rules
- Do not copy protected names, sprites, sounds, or exact layouts from Pac-Man
- Use original enemy names and artwork
- Keep movement, collision, and score systems separated into managers
- Prefer data-driven tuning for speeds, timers, and scoring

## Implementation priorities
1. Grid and tile map loading
2. Player movement and input buffering
3. Pellet collection and score
4. Enemy state machine
5. Power-up logic
6. Round manager and life system
7. UI and polish

## Strong defaults
- Tile size: 16 or 24 px
- Fixed timestep logic mindset
- Movement decisions made at intersections
- Enemy target logic chosen via behavior functions

## Deliverable style
When using this skill, output should favor:
- production-friendly folder structure
- readable TypeScript
- separated config/data files
- clear comments around grid math and AI choices

## Common pitfalls to avoid
- moving purely in freeform pixel space without tile anchors
- mixing render state and gameplay state
- hardcoding enemy behavior directly inside one giant update loop
- making frightened mode completely random every frame instead of per decision point
- using exact classic maze dimensions unless intentionally transformed
