# Project Structure

## Recommended stack
- Phaser 3
- TypeScript
- Vite
- ESLint + Prettier

## Suggested setup commands
```bash
npm create vite@latest pixel-chomp -- --template vanilla-ts
cd pixel-chomp
npm install phaser
npm install -D eslint prettier
```

## Recommended folders
```text
pixel-chomp/
  public/
    assets/
      audio/
      images/
      maps/
      ui/
  src/
    main.ts
    game/
      config.ts
      scenes/
      entities/
      ai/
      systems/
      data/
      ui/
      utils/
  docs/
  package.json
  tsconfig.json
  vite.config.ts
```

## First files to create
- BootScene.ts
- PreloadScene.ts
- MainMenuScene.ts
- GameScene.ts
- Player.ts
- Enemy.ts
- GridManager.ts
- RoundManager.ts
- ScoreManager.ts
- rounds.ts
- enemies.ts
- scoring.ts
