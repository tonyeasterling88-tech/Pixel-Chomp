# Pixel Chomp Test Plan

## Functional tests
- player can move in all four directions
- queued turns trigger correctly at intersections
- player cannot move through walls
- pellets disappear and score increments
- power pellets trigger frightened mode
- vulnerable enemies can be eaten
- eaten enemies return correctly
- lives decrement on hit
- round ends when pellets are cleared
- game over triggers after final life

## Feel tests
- turning feels responsive
- enemy pressure feels fair
- frightened mode feels rewarding
- screen readability stays strong during chaos

## Regression tests
- pause during power mode
- respawn after enemy overlap edge cases
- restarting from game over resets values correctly
- saving and loading high score works
