# DeusETH New — Frontend

Curatorial website for DeusETH, a crypto-theatre artwork from 2018. 50 token-characters on Ethereum mainnet die across 10 episodes until 3 survive. The site presents this as a completed historical artefact.

**Lore Bible (concept, episodes, characters):** `/Users/ivansokolov/DeusETH/bible/README.md`
Canon facts, episode scripts, character roster, philosophy, and smart contract docs live there. Consult it for any narrative or lore questions.

## Tech Stack

- **React 19** + **Vite 8** (JSX, no TypeScript)
- **React Router DOM 7** — client-side routing
- **react-slick** — episode carousels
- **use-sound** — audio playback (death/revival/winner sounds)
- **lucide-react** — icons
- **classnames** — conditional class composition
- **ESLint** — flat config (`eslint.config.js`)
- **Deploy:** Vercel + Cloudflare Workers

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build → /dist
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Project Structure

```
src/
  pages/          # 4 route-level components
    Adventures.jsx  — Main episode player (default route)
    Statement.jsx   — Museum wall text (modal overlay)
    History.jsx     — Blockchain timeline (modal overlay)
    Lore.jsx        — Worldbuilding & tribes (modal overlay)
  components/     # 27 reusable components
  hooks/          # Custom hooks (useCharacterStatuses)
  utils/          # Helpers (audio player factory, etc.)
  styles/         # Per-component CSS files + App.css (variables, globals)
  data/           # JSON: characters.json, stories/, obits/
  images/         # SVG logo
public/
  data/episodes/  # Episode JSON configs (events, media, art paths)
  images/         # Character art, episode art, backgrounds
  sounds/         # Audio files (buzzer, reborn, winner)
```

## Routing

```
/                          → redirects to /adventures
/adventures                — episode list (slider)
/adventures/:episodePath   — specific episode (e.g., 01_bloody_kitties)
/adventures/:episodePath/story/:heroId  — character story
/adventures/:episodePath/obit/:heroId   — character obituary
/statement                 — modal overlay (Statement page)
/history                   — modal overlay (History page)
/lore                      — modal overlay (Lore page)
```

Statement, History, Lore open as full-screen overlays on top of the Adventures background via React Router location state.

## Key Architecture Patterns

### State Management
No Redux or Context. Local `useState` + one critical custom hook:
- **`useCharacterStatuses()`** — single source of truth for character alive/dead/dying state

### Character State Machine
```
alive → dying → dying-settled (3.2s) → dead
dead → reviving → alive
```

### Event-Driven Deaths
Episode JSON files define `events` array. Events trigger based on:
- **No `at` field** — fires on episode load
- **`at.videoTime`** — fires at video timestamp
- **`at.slide`** — fires at carousel slide index

Actions: `die`, `revive`, `highlight`, `winner`

### Modal Layer
Statement/History/Lore are overlays. Adventures stays mounted underneath. Close via Esc or click-outside.

### Styling
- Per-component CSS files in `src/styles/`
- CSS custom properties in `App.css`
- Fonts: Alegreya (serif), Alegreya Sans (sans-serif)
- Mobile-first responsive (`@media max-width: 600px`)
- Death/revival CSS animations + IntersectionObserver fade-ins

## Data Model

**Characters** (`src/data/characters.json`): id (1-50), name, bio, group (survival|humanity|order), preview image path, sale data.

**Episodes** (`public/data/episodes/*.json`): id, slug, type, title, art paths, media config (video/carousel/image), events array, characterStories.

**Stories** (`src/data/stories/`): Draft.js editor format with rich blocks.

**Obits** (`src/data/obits/`): Obituaries indexed by episode.

## Canon Reference

- 50 tokens start; 3 survivors: **Harold (#5), Danko (#10), Lucy (#11)**
- Smart Contract governs all deaths — fate is encoded, not arbitrary
- Canonical tagline: **Always for some. But never for all.**
- Full lore, episode details, character bios → see bible at path above
