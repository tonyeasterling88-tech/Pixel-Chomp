# Pixel Chomp – Maze Generation Blueprint

## Purpose
This blueprint defines how the maze should be structured, stored, rendered, and validated for **Pixel Chomp**.

---

## Core Design Philosophy
A great maze for a maze-chase game should:
- Be easy to read
- Offer multiple escape routes
- Support ambushes and reversals
- Contain recognizable loops
- Work cleanly with tile-based movement

For Pixel Chomp, the best starting point is:
1. **Hand-authored maze layout**
2. Optional support for future procedural variants
3. Strict tile rules for collision and navigation

---

## Tile Grid Standard

Recommended tile size:
```text
16 x 16 pixels
```

Recommended board dimensions:
```text
28 columns x 31 rows
```

This gives a classic arcade feel while staying manageable.

---

## Tile Types

| Symbol | Meaning |
|---|---|
| `#` | Wall |
| `.` | Pellet |
| `o` | Power pellet |
| ` ` | Empty walkable space |
| `P` | Player spawn |
| `G` | Ghost house / spawn |
| `D` | Ghost door |
| `F` | Fruit spawn |
| `T` | Tunnel / wrap tile |

---

## Example Maze Representation

```text
############################
#............##............#
#.####.#####.##.#####.####.#
#o####.#####.##.#####.####o#
#..........................#
#.####.##.########.##.####.#
#......##....##....##......#
######.##### ## #####.######
######.##          ##.######
######.## ###DD### ##.######
      .   #GGGGGG#   .
######.## ######## ##.######
######.##          ##.######
######.## ######## ##.######
#............##............#
#.####.#####.##.#####.####.#
#o..##................##..o#
###.##.##.########.##.##.###
#......##....##....##......#
#.##########.##.##########.#
#..........................#
############################
```

---

## Maze Data Structure

Recommended format:
```pseudo
maze[row][col]
```

Each tile stores:
- tile type
- pellet present or not
- passable or blocked
- optional special metadata

Example tile object:
```json
{
  "type": "pellet",
  "walkable": true,
  "hasPellet": true
}
```

---

## Collision Rules

### Blocked tiles
- Walls are not walkable
- Ghost house interior may be restricted depending on state
- Ghost door allows ghost-only transitions

### Walkable tiles
- Corridor
- Pellet tile
- Power pellet tile
- Tunnel tile
- Fruit tile

---

## Tunnel / Wraparound System

Left and right tunnel edges should wrap.

```pseudo
if player.x < 0:
    player.x = mazeWidth - 1

if player.x > mazeWidth - 1:
    player.x = 0
```

Tunnel tiles should also slow ghosts for better balance.

---

## Pellet Placement Rules

Pellets should be placed:
- In most normal walkable corridors
- Not inside ghost house
- Not directly on player spawn
- Not on the ghost door tile

Power pellets:
- Usually 4 per board
- Best near outer corners for strategic tension

---

## Fruit Spawn Rules

Fruit spawns:
- Near center of maze
- Typically below ghost house
- Only appears after specific pellet milestones

Example:
```pseudo
if pelletsRemaining == 170:
    spawnFruit()

if pelletsRemaining == 70:
    spawnFruit()
```

---

## Spawn Rules

### Player spawn
- Just below center lane
- Enough immediate space to move safely

### Ghost spawn
- Inside ghost house

### Ghost door
- Exit path between ghost house and main maze
- Ghost-only for some states

---

## Maze Design Principles

### Good lane balance
Include:
- short loops
- long lanes
- dead-end avoidance
- ambush points
- safe-looking routes that are not fully safe

### Readability
Use:
- strong wall contrast
- clear pellet lines
- obvious tunnels
- recognizable center structure

---

## Movement Alignment

Movement decisions should occur at tile centers.

```pseudo
if entity.isCenteredOnTile():
    allowTurnCheck()
```

This makes cornering feel crisp and clean.

---

## Rendering Rules

Recommended render layers:
1. Background
2. Maze walls
3. Pellets / power pellets
4. Fruit
5. Player
6. Ghosts
7. UI overlay

---

## Manual Maze Authoring Workflow

Best workflow:
1. Design maze in plain text
2. Parse symbols into tile objects
3. Auto-count pellets
4. Validate spawns and tunnels
5. Render in engine

---

## Validation Checklist

Before using a maze:
- Player spawn exists
- Ghost house exists
- Ghost door exists
- Fruit spawn exists
- All pellets reachable
- No isolated walkable regions
- Tunnel wrap works
- Pellet count matches expected total

---

## Connectivity Validation

Run a flood-fill from the player start:
- All walkable non-house tiles should be reachable
- Any unreachable tile means broken maze design

```pseudo
floodFill(playerSpawn)
assert allWalkableTilesVisited == true
```

---

## Procedural Maze Variant (Future)
If you later want generated mazes:
- Start with macro symmetry
- Guarantee connectivity
- Reserve center block for ghost house
- Add pellets after layout is validated

But for MVP, use a hand-authored maze. It will feel better.

---

## Pseudocode – Maze Load

```pseudo
function loadMaze(textRows):
    for row in rows:
        for col in cols:
            symbol = textRows[row][col]
            tile = createTileFromSymbol(symbol)
            maze[row][col] = tile
```

---

## Pseudocode – Pellet Count

```pseudo
pelletCount = 0

for each tile in maze:
    if tile.type == PELLET or tile.type == POWER_PELLET:
        pelletCount += 1
```

Round ends when:
```pseudo
if pelletCount == 0:
    completeLevel()
```

---

## Asset Requirements
- `maze_tile_wall.png`
- `maze_tile_corner_inner.png`
- `maze_tile_corner_outer.png`
- `maze_tile_straight.png`
- `pellet.png`
- `power_pellet.png`
- `fruit.png`

---

## Final Goal
The maze should feel:
- Iconic
- Legible
- Replayable
- Fair
- Strategic
- Easy to extend with future themes
