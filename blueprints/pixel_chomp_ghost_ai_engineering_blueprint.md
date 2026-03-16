# Pixel Chomp – Ghost AI Engineering Blueprint

## Purpose
This blueprint defines how enemy behavior should work in **Pixel Chomp** so the ghosts feel readable, strategic, and arcade-authentic without being unfair.

---

## Core Design Philosophy
Good maze-chase enemy AI should:
- Be predictable enough to learn
- Be different enough per enemy to create variety
- Escalate pressure as the board clears
- Change state cleanly when power mode begins

Each ghost should use:
1. A **mode/state**
2. A **targeting rule**
3. A **movement rule**
4. A **speed modifier**

---

## Ghost States

| State | Description |
|---|---|
| Scatter | Ghost retreats to assigned region/corner |
| Chase | Ghost targets the player using its own rule |
| Frightened | Ghost runs away and can be eaten |
| Eyes Return | Ghost returns to the house/base after being eaten |
| Spawn/Release | Ghost is waiting to enter the maze |

---

## Global Mode Loop

Recommended classic timing pattern:

| Phase | Duration |
|---|---:|
| Scatter 1 | 7s |
| Chase 1 | 20s |
| Scatter 2 | 7s |
| Chase 2 | 20s |
| Scatter 3 | 5s |
| Chase 3 | 20s |
| Scatter 4 | 5s |
| Final Chase | until level ends |

When the mode changes from **Scatter ↔ Chase**, all active ghosts should reverse direction once.

---

## Ghost Personalities

Use four distinct enemy roles.

### 1. Red Ghost – Aggressor
Direct pursuer. Always puts pressure on the player.

**Target rule**
```pseudo
targetTile = player.currentTile
```

**Behavior**
- Most direct
- Fastest-feeling
- Good at forcing mistakes

---

### 2. Pink Ghost – Ambusher
Attempts to move where the player is going.

**Target rule**
```pseudo
targetTile = tile 4 spaces ahead of player direction
```

**Behavior**
- Strong near intersections
- Creates “cut off” pressure
- Punishes straight-line escape

---

### 3. Cyan Ghost – Vector Hunter
More complex and less predictable.

**Target rule**
```pseudo
anchorTile = tile 2 spaces ahead of player
vector = anchorTile - redGhost.currentTile
targetTile = anchorTile + vector
```

**Behavior**
- Indirect pressure
- Creates surprise flanks
- Strong when combined with Red

---

### 4. Orange Ghost – Shy Trickster
Acts aggressive at long range and evasive at short range.

**Target rule**
```pseudo
if distanceToPlayer >= 8 tiles:
    targetTile = player.currentTile
else:
    targetTile = orangeGhost.scatterCorner
```

**Behavior**
- Weird, twitchy pressure
- Harder to read
- Keeps outer maze active

---

## Scatter Targets

Assign each ghost a unique retreat zone.

| Ghost | Scatter Area |
|---|---|
| Red | Top-right |
| Pink | Top-left |
| Cyan | Bottom-right |
| Orange | Bottom-left |

Scatter should not be random. It should feel intentional and repeatable.

---

## Frightened Mode

Triggered by power pellet.

### Effects
- Ghosts reverse direction once
- Speed reduced
- Movement becomes semi-random
- Ghosts become edible
- Blue/frightened sprite is shown
- Flashing begins shortly before frightened ends

### Recommended frightened timing
| Level | Duration |
|---|---:|
| 1 | 6.0s |
| 2 | 5.0s |
| 3 | 4.0s |
| 4+ | 2.5s |
| Late game | 0–1.5s |

---

## Eyes Return State

When eaten:
- Ghost body disappears
- Only eyes remain
- Ghost returns to home/base using fastest route
- Once it reaches base, it regenerates and re-enters normal cycle

```pseudo
onGhostEaten():
    state = EYES_RETURN
    speed = eyesReturnSpeed
    targetTile = ghostHouseDoor
```

---

## Movement Rules

Ghosts move tile-to-tile but should appear smooth in pixel space.

### Intersection rules
At each intersection:
1. Determine valid directions
2. Exclude reverse unless forced by mode switch
3. Choose direction closest to target tile
4. If frightened, choose randomly from valid directions

### Tie-break priority
To keep movement deterministic:
```pseudo
UP > LEFT > DOWN > RIGHT
```

This produces stable and learnable behavior.

---

## Speed System

Suggested baseline speed tuning:

| Entity | Normal | Tunnel | Frightened |
|---|---:|---:|---:|
| Player | 100% | 100% | 100% |
| Red | 95% | 60% | 75% |
| Pink | 95% | 60% | 75% |
| Cyan | 95% | 60% | 75% |
| Orange | 95% | 60% | 75% |
| Eyes Return | 140% | N/A | N/A |

Adjust percentages relative to your engine’s base movement speed.

---

## Release Logic

Not all ghosts should start active immediately.

Suggested release pattern:
- Red starts immediately
- Pink after a small delay
- Cyan after X pellets eaten
- Orange after more pellets eaten

Example:
```pseudo
if pelletsEaten >= 20:
    releaseCyan()

if pelletsEaten >= 50:
    releaseOrange()
```

This keeps early levels manageable.

---

## Collision Logic

### Player hits normal ghost
```pseudo
if ghost.state in [CHASE, SCATTER] and overlap(player, ghost):
    player.die()
```

### Player hits frightened ghost
```pseudo
if ghost.state == FRIGHTENED and overlap(player, ghost):
    ghost.enterEyesReturn()
    awardGhostPoints()
```

---

## Ghost Combo Scoring

Each frightened ghost eaten in one power cycle increases score:

| Ghost # eaten | Score |
|---|---:|
| 1st | 200 |
| 2nd | 400 |
| 3rd | 800 |
| 4th | 1600 |

Reset the chain when frightened mode ends.

---

## Difficulty Escalation

As levels rise:
- Frightened duration decreases
- Ghost speed increases slightly
- Release timing becomes faster
- Final chase lasts longer
- Late game may reduce frightened mode to nearly zero

---

## Pseudocode – Ghost Update

```pseudo
function updateGhost(ghost):

    if ghost.state == EYES_RETURN:
        ghost.targetTile = ghostHouseDoor
        ghost.moveTowardTarget(allowReverse=true)
        return

    if ghost.state == FRIGHTENED:
        ghost.moveRandomLegalDirection()
        return

    if globalMode == SCATTER:
        ghost.targetTile = ghost.scatterCorner

    if globalMode == CHASE:
        ghost.targetTile = computeGhostTarget(ghost)

    ghost.moveTowardTarget(allowReverse=false)
```

---

## Engineering Notes
For the best feel:
- Use tile logic for decisions
- Use pixel interpolation for smooth motion
- Keep movement deterministic unless frightened
- Test pathing at every intersection
- Verify ghosts never clip walls or double-reverse accidentally

---

## Recommended Assets
- `ghost_red.png`
- `ghost_pink.png`
- `ghost_cyan.png`
- `ghost_orange.png`
- `ghost_frightened.png`
- `ghost_frightened_flash.png`
- `ghost_eyes.png`

---

## Final Goal
The ghosts should feel:
- Distinct
- Learnable
- Pressuring
- Fair
- Nostalgic
- Strategically layered
