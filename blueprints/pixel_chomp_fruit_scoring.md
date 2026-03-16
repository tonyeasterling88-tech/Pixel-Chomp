
# Pixel Chomp – Fruit Scoring Table

This document defines the scoring values for bonus fruit items in **Pixel Chomp**.

Fruit appear periodically during a level and grant bonus points when collected.

---

## Scoring Table

| Fruit | Points |
|------|--------|
| Cherry | 100 |
| Strawberry | 300 |
| Orange | 500 |
| Apple | 700 |
| Melon | 1000 |
| Banana | 2000 |
| Key | 5000 |

---

## Spawn Logic (Suggested)

Fruit should appear after certain pellet milestones are reached.

Example:

```
if pelletsRemaining == 170:
    spawnFruit()

if pelletsRemaining == 70:
    spawnFruit()
```

The fruit should remain visible for a limited time (typically **8–10 seconds**).

---

## Bonus Display

When the player eats a fruit:

1. Play fruit sound effect
2. Show floating score number
3. Add points to total score
4. Remove fruit sprite

Example pseudo logic:

```
onFruitEat():
    addScore(fruitValue)
    playSound("fruit_eat")
    showScorePopup(fruitValue)
    removeFruit()
```

---

## File Structure

Recommended asset structure:

```
assets/
  fruit/
    fruit_cherry.png
    fruit_strawberry.png
    fruit_orange.png
    fruit_apple.png
    fruit_melon.png
    fruit_banana.png
    fruit_key.png
```

---

## Notes

These values are inspired by classic arcade bonus systems but can be tuned for difficulty balancing.

Higher value fruit should typically appear in later levels.
