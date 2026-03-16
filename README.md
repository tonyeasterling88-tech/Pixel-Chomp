# Pixel Chomp Scaffold

Pixel Chomp is a maze-chase arcade game scaffold inspired by classic pellet-running design, but built as its own original game system.

This starter pack includes:
- a full game blueprint
- reusable skill files
- focused agent files
- implementation prompts
- a suggested project structure
- milestone and testing docs

## Recommended stack
- **Engine:** Phaser 3 for browser-first release
- **Language:** TypeScript
- **Build:** Vite
- **Audio:** Howler or Phaser audio
- **Storage:** localStorage for high scores/settings
- **Art direction:** crisp 2D pixel art with readable silhouettes

## Suggested first build order
1. Build the maze grid and movement system
2. Add pellet collection and score
3. Add enemy AI states and path choice logic
4. Add power-up mode and enemy vulnerability
5. Add lives, restart flow, and round progression
6. Add juice: sounds, particles, screens, polish

## Included files
- `blueprints/Pixel-Chomp-Blueprint.md`
- `skills/Pixel-Chomp-Game-Dev-Skill.md`
- `skills/Pixel-Chomp-AI-Skill.md`
- `skills/Pixel-Chomp-Level-Design-Skill.md`
- `skills/Pixel-Chomp-Polish-QA-Skill.md`
- `agents/Gameplay-Architect-Agent.md`
- `agents/Systems-Implementer-Agent.md`
- `agents/QA-Balance-Agent.md`
- `agents/Art-Audio-Director-Agent.md`
- `docs/Project-Structure.md`
- `docs/MVP-Roadmap.md`
- `docs/Test-Plan.md`
- `prompts/Codex-Prompts.md`

## Naming note
Pixel Chomp is treated here as an original maze-chase arcade game. Avoid copying protected character names, sounds, sprite shapes, ghost color identities, or exact maze layouts.

## Host it on GitHub Pages
This project is now set up to deploy to GitHub Pages from the `main` branch with GitHub Actions.

### One-time setup
1. Create a new empty GitHub repository.
2. In this folder, run:

```powershell
git init -b main
git add .
git commit -m "Prepare Pixel Chomp for GitHub Pages"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

3. On GitHub, open `Settings` -> `Pages`.
4. If GitHub asks for a source, choose `GitHub Actions`.
5. Pushes to `main` will now rebuild and redeploy the game automatically.

### Your live URL
After the first workflow finishes, the game should be available at:

`https://YOUR-USERNAME.github.io/YOUR-REPO/`

### Updating the live game
Whenever you change the game, run:

```powershell
git add .
git commit -m "Update Pixel Chomp"
git push
```

GitHub Actions will rebuild the site and publish the new version automatically.
