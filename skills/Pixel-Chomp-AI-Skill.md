# Pixel Chomp AI Skill

## Purpose
Implement enemy behavior that feels learnable, tense, and distinct without requiring expensive pathfinding.

## AI philosophy
Pixel Chomp enemy AI should be:
- deterministic at intersections
- personality-driven
- readable by the player
- adjustable through config tables

## Enemy behavior model
Each enemy should have:
- current mode
- current direction
- current tile
- target tile logic
- legal turn calculation
- speed modifier

## State set
- spawn
- scatter
- chase
- frightened
- returning

## Decision rules
At each intersection:
1. collect legal directions
2. remove reverse unless forced
3. compute candidate next tile for each direction
4. evaluate distance to target tile
5. choose best direction or random weighted option if frightened

## Suggested personalities
- Glint: target player tile directly
- Drift: target a few tiles ahead of movement direction
- Vector: combine player forward target with Glint position
- Mope: chase when far, retreat when near

## Tuning parameters
Externalize:
- scatter/chase timers
- frightened duration
- frightened flash threshold
- base enemy speeds
- tunnel slowdowns
- release timing

## QA checks
- enemies should not jitter at corners
- enemies should not reverse constantly
- frightened mode should feel different but fair
- each enemy should create a unique pursuit pattern
