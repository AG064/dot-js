# Island War — Implementation Plan

## Current State
- M1: Lobby ✅, M2: Arena ✅, M3: Buildings ✅, M5: Economy ✅
- M4 (Projectiles): Server fires, client doesn't animate
- M6 (Era visuals): Logic works, CSS themes not fully connected
- M7 (Sound): Partially done
- Keyboard: 1-4 for cards ✅, Esc for menu ✅, but WASD not needed (no camera)

## Phase 1: Keyboard Controls (Bonus + Requirements)
**Files:** `public/game.js`

Current state:
- ✅ 1-4 keys select cards from hand (already implemented, line 977)
- ✅ Esc key pauses (already implemented, line 1104)
- ✅ Enter key for placement (need to check)
- ❌ Q for special ability (no special ability per se)
- ❌ Only 1-4, but HAND_SIZE might be 5

Improvements:
1. Fix keyboard handler to support up to 5 cards (HAND_SIZE)
2. Add Enter key to place selected card on last hovered cell
3. Add visual feedback for keyboard-selected cards (already has `.selected` class)
4. Add hint text showing keyboard shortcuts in HUD

## Phase 2: AI Opponents (Secondary Task)
**Files:** `backend/ws.js`, `public/index.html`, `public/game.js`

### AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Module                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Easy   │  │  Medium   │  │   Hard   │  │  Player  │   │
│  │  (Bot)   │  │  (Bot)    │  │  (Bot)   │  │ (Human)  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            ▼                                 │
│                   ┌─────────────────┐                        │
│                   │  AI Controller  │                        │
│                   │  tick-based     │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Game State     │                        │
│                   │  (authoritative)│                        │
│                   └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### AI Decision Loop

```
Every tick:
  1. Check if cooldown expired (based on difficulty)
  2. Evaluate grid state
  3. Choose action based on strategy
  4. Execute via same handlePlace() as human
```

### AI Strategies

**Easy Bot:**
- Random card selection
- Random empty cell placement
- 50% chance to do nothing each tick
- Doesn't upgrade buildings

**Medium Bot:**
- Greedy: prioritizes mortars when has resources
- Places workers early for economy
- Places buildings next to synergistic neighbors
- 20% chance to do nothing
- Upgrades existing buildings sometimes

**Hard Bot:**
- Strategic: adapts to current game state
- Targets weak spots in enemy grids
- Maintains economy + offense balance
- Coordinates: mortar placement near reactor
- Rarely wastes resources

### Lobby Changes

Add single-player toggle in join screen:
- Radio button: "Multiplayer" / "Single Player"
- If Single Player: show difficulty selector (1-3 bots)
- Bot count slider: 1-3

### File Changes

**`backend/ws.js` additions:**
```javascript
// AI bot class
class AIBot {
  constructor(playerId, difficulty = 'medium') {
    this.id = playerId;
    this.difficulty = difficulty; // 'easy' | 'medium' | 'hard'
    this.cooldown = 0;
    this.setupDifficulty();
  }

  setupDifficulty() {
    const params = {
      easy:   { reactionMs: 800, errorRate: 0.5, strategy: 'random' },
      medium: { reactionMs: 400, errorRate: 0.2, strategy: 'greedy' },
      hard:   { reactionMs: 100, errorRate: 0.05, strategy: 'strategic' },
    };
    Object.assign(this, params[this.difficulty]);
  }

  decideAction(gameState) { /* ... */ }
  getAvailablePlacements(grid) { /* ... */ }
}
```

**`public/index.html` additions:**
- Toggle switch: Single Player / Multiplayer
- Bot count selector (1-3)
- Difficulty display per bot

**`public/game.js` additions:**
- Toggle single-player mode UI
- AI status indicators in HUD
- Bot count during gameplay

## Phase 3: Visual Improvements

### Era CSS Themes
Add era-specific body classes and update `style.css`:
```css
body.era-1 { --era-bg: #d4c4a8; --era-accent: #8b7355; }
body.era-2 { --era-bg: #c9b896; --era-accent: #6b5344; }
body.era-3 { --era-bg: #b8b8b8; --era-accent: #444; }
body.era-4 { --era-bg: #1a1a2e; --era-accent: #0ff; }
```

### Projectile Animation (M4)
Add client-side projectile visualization:
```javascript
function handleFire(msg) {
  // msg: { typeId, sourcePos, targetPos, projectileId }
  spawnProjectile(msg.sourcePos, msg.targetPos, msg.typeId);
}

function spawnProjectile(from, to, typeId) {
  // Create div at source, animate to target using requestAnimationFrame
  // Use CSS transform for smooth 60fps animation
}
```

## Phase 4: Sound Effects
Web Audio API integration for:
- Building placement
- Projectile fire/impact
- Caravan spawn/deliver
- Player defeat
- Game over

## Testing Checklist
- [ ] Join lobby with 2-4 players
- [ ] Select doctrine and ready up
- [ ] Start game as host
- [ ] Place buildings via click and 1-5 keys
- [ ] Earn resources over time
- [ ] See mortar projectiles animate
- [ ] Pause/resume via Esc
- [ ] AI opponents play independently (single-player)
- [ ] Timer counts down correctly
- [ ] Game over screen shows winner