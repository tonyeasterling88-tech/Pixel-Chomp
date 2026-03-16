
# Pixel Chomp – Sound Engineering Blueprint

## Core Philosophy
Classic arcade sound design follows three rules:
1. Very short sounds
2. Event-driven triggers
3. Minimal overlap

Original arcade hardware had limited sound channels, so sounds were queued and prioritized.

---

## Sound Event Table

| Event | Sound | Duration | Priority |
|---|---|---|---|
| Pellet eaten | pellet.wav | 0.07s | Low |
| Power pellet | power.wav | 0.4s | High |
| Ghost eaten | ghost_eat.wav | 0.3s | High |
| Player death | death.wav | 1.0s | Critical |
| Level start | start.wav | 1.2s | Critical |
| Level complete | victory.wav | 1.0s | High |
| Frightened mode | frightened.wav | loop | Medium |

---

## Pellet Sound Logic (Waka-Waka System)

The pellet sound alternates between two tones.

```pseudo
pelletToggle = false

onPelletEat():
    if pelletToggle:
        play("pellet_high.wav")
    else:
        play("pellet_low.wav")

    pelletToggle = !pelletToggle
```

This alternating pattern creates the classic arcade rhythm.

---

## Power Pellet Trigger Logic

```pseudo
onPowerPelletEat():
    play("power.wav")
    enableFrightenedMode()
    startLoop("frightened_loop.wav")
```

During frightened mode ghosts should:
- Slow movement
- Turn blue
- Run away from the player

---

## Ghost Eat Sound

Triggered when player collides with a frightened ghost.

```pseudo
onGhostEat():
    stop("frightened_loop")
    play("ghost_eat.wav")
    ghost.enterEyesMode()
```

The ghost transitions to **eyes returning to base**.

---

## Player Death Sound

This must override all other sounds.

```pseudo
onPlayerDeath():
    stopAllSounds()
    play("death.wav")
    disablePlayerMovement()
```

---

## Sound Priority System

Arcade games limited simultaneous audio playback.

Priority levels:

```
3 Critical
2 High
1 Medium
0 Low
```

Playback rule:

```pseudo
if newSound.priority >= currentSound.priority:
    interrupt currentSound
```

---

## Example Sound Manager

```pseudo
class SoundManager:

    currentSound = null

    play(sound):

        if currentSound == null:
            playSound(sound)

        else if sound.priority >= currentSound.priority:
            stop(currentSound)
            playSound(sound)
```

---

## Audio Timing System

Pellet sounds should not stack.

```
PELLET_SOUND_COOLDOWN = 60ms
```

```pseudo
if timeSinceLastPelletSound > cooldown:
    playPelletSound()
```

---

## Frightened Mode Sound Loop

```pseudo
frightenedDuration = 6 seconds

startLoop("frightened.wav")

after 6 seconds:
    stopLoop("frightened.wav")
```

---

## Recommended Audio Specifications

For authentic arcade-style sound:

```
Format: WAV
Sample rate: 22050 Hz
Channels: Mono
Bit depth: 16-bit
```

---

## Pixel Chomp Audio File Structure

```
audio/

pellet_high.wav
pellet_low.wav
power.wav
ghost_eat.wav
frightened_loop.wav
death.wav
victory.wav
start.wav
```

---

## Optional Advanced Arcade Features

### Speed-Up Music
When pellets remaining < 20:

```
increase tempo
increase ghost speed
```

### Ghost Siren System

Classic arcade games used a siren that increases pitch as danger rises.

Stages:

```
Stage 1 – slow siren
Stage 2 – medium siren
Stage 3 – fast siren
Stage 4 – panic siren
```

---

## Integration Examples

### Phaser
```javascript
this.sound.play("pellet");
```

### Unity
```csharp
AudioSource.Play();
```

### HTML5 / Electron
Use the WebAudio API for low-latency playback.
