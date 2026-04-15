# DeusETH — Data & State Architecture Spec

## Goals

1. Single source of truth for each episode: one JSON file contains everything (story, media, character events, obituaries, personal stories).
2. Human-readable and AI-readable: a non-technical person or an LLM can understand the full narrative by reading `public/data/episodes/`.
3. Clean character state machine: two states (`alive` / `dead`), explicit transitions (`die` / `revive`), unified media events — no hidden flags, no dual arrays, no suppression logic.
4. Scrub-safe: rewinding video replays death/revive animations correctly.

---

## File Structure

```
public/
  data/
    episodes/
      00_prologue.json
      01_bloody_kitties.json
      02_wolf_party.json
      03_freedom_to_die.json
      04_redrum.json
      05_murder.json
      06_the_final_battle.json
      07_scam.json
      08_hard_fork.json
      09_tokencide.json
      10_tokenville.json

src/
  data/
    characters.json          ← unchanged
  hooks/
    useCharacterStatuses.js  ← NEW: all status logic in one place
  components/
    Episode.jsx              ← updated: no more import.meta.glob, no hardcoded IDs
    CharacterList.jsx        ← updated: uses hook, no suppression logic
    EpisodeMedia.jsx         ← updated: accepts structured media object
  utils/
    draftjsToText.js         ← NEW: Draft.js → plain text (used only by migration script)

scripts/
  migrate-data.js            ← one-time migration script
```

---

## Episode JSON Schema

```json
{
  "id": 1,
  "slug": "bloody_kitties",
  "type": "episode",
  "number": "Episode I",
  "title": "Bloody Kitties",
  "subtitle": "",

  "story": [
    "First paragraph...",
    "Second paragraph with <span data-link='3' class='mention'>Tracey</span> mention."
  ],

  "art": {
    "slide":      "/images/episodes/slides/cover-01.png",
    "homeSlide":  "/images/episodes/slides/home_cover-01.png",
    "background": "/images/episodes/1/back.jpg",
    "sharePic":   "/images/episodes/1/comics.png",
    "map":        null
  },

  "media": {
    "type":  "video",
    "src":   "https://cdn.example.com/episode_1.mp4",
    "cover": "/images/episodes/1/comics.png"
  },

  "subtitles": [
    { "lang": "en", "label": "EN", "src": "/subtitles/episode_1.en.vtt" }
  ],

  "events": [
    { "characters": [13],     "action": "die" },
    { "characters": [44],     "action": "die",       "at": { "videoTime": 46 } },
    { "characters": [48],     "action": "die",       "at": { "videoTime": 47 } },
    { "characters": [5],      "action": "highlight", "at": { "videoTime": 8  } },
    { "characters": [3,10,2], "action": "highlight", "at": { "videoTime": 20 } }
  ],

  "obits": {
    "13": { "image": "/images/episodes/1/obits/dead_gary.gif",  "text": "Gary was a trustful..." },
    "44": { "image": "/images/episodes/1/obits/dead_leo.gif",   "text": "For Leo the war..." },
    "48": { "image": null,                                       "text": "We did not know..." }
  },

  "characterStories": {
    "21": { "image": "/images/episodes/1/stories/vincent.gif", "text": "As a businessman..." },
    "7":  { "image": "/images/episodes/1/stories/the_eye.gif", "text": "Good day and a great fight..." }
  }
}
```

### `type` field values

| Value | Meaning |
|-------|---------|
| `"prologue"` | All characters start dead; story begins here |
| `"episode"` | Standard episode |
| `"finale"` | Last episode (Tokenville) |

### `media` object shapes

```json
{ "type": "video",      "src": "url",  "cover": "url", "statsUnlockAt": 26 }
{ "type": "gallery",    "slides": ["url", "url", ...],  "cover": "url" }
{ "type": "image",      "src": "url" }
{ "type": "tokenville" }
```

`statsUnlockAt` — optional, only on prologue. Video seconds at which the alive/dead counter appears.

### `events` array

Each event has:
- `characters` — array of character IDs, or the string `"all"`
- `action` — `"die"` | `"revive"` | `"highlight"` | `"winner"`
- `at` — optional; omit for episode-level events (happen on episode load)
  - `{ "videoTime": 46 }` — fires when video reaches this second
  - `{ "slide": 7 }` — fires when gallery reaches this slide index

Rules:
- A character can have both an episode-level `die` (for stat counter) AND a media-synced `die` (for animation timing). The media-synced one controls the animation; the episode-level one establishes the final state.
- `highlight` and `winner` are visual-only effects, they do not change alive/dead state.
- For prologue: `{ "characters": "all", "action": "revive", "at": { "videoTime": 25 } }` replaces 50 individual entries.
- For Hard Fork: `{ "characters": "all", "action": "revive" }` with no `at` means all revive on episode load.

---

## Character State Machine

### States

```
alive  ←──revive──  dead
  │                   │
  └──────die─────────→┘
```

Only two persistent states. Animations are side-effects of transitions, not states.

### Derived animation hints (not stored, computed)

| Transition | Animation played |
|-----------|-----------------|
| `alive → dead` | blood splash + skull |
| `dead → alive` | strobe revive glow |
| `highlight` event | brief glow, no state change |
| `winner` event | trophy overlay |

### How status is computed at any point in time

```
buildTimeline(episode.events)
  → flat list of { characterId, action, at? } sorted by time

applyEventsUpTo(timeline, currentTime)
  → Map<characterId, 'alive' | 'dead'>
```

For episode-level events (no `at`): apply immediately when episode loads.
For media-synced events: apply when `currentVideoTime >= at.videoTime` or `currentSlide >= at.slide`.

**Backward scrubbing**: re-compute from scratch by replaying all events up to new time. No `firedRef` Set.

### `useCharacterStatuses` hook API

```js
const { statusOf, aliveCount, deadCount, pendingAnimation } =
  useCharacterStatuses({ episode, episodes, currentVideoTime, currentSlide })

statusOf(characterId)
// returns: 'alive' | 'dead' | 'dying' | 'reviving'
// 'dying'   = transition alive→dead in progress (animation window)
// 'reviving' = transition dead→alive in progress (animation window)

aliveCount  // number, updates immediately on episode change (no 550ms delay)
deadCount   // number

pendingAnimation(characterId)
// returns: null | { type: 'die' | 'revive', triggeredAt: number }
// used by CharacterList to know when to play CSS animation
```

---

## Migration: What Changes Where

### Data files

| Old | New | Action |
|-----|-----|--------|
| `public/data/adventures.json` | `public/data/episodes/*.json` | Split + restructure |
| `src/data/obits/*.json` | Inside episode JSON as `"obits"` | Merge, convert Draft.js → text |
| `src/data/stories/*.json` | Inside episode JSON as `"characterStories"` | Merge, convert Draft.js → text |
| `src/data/stories/index.js` | — | Delete (unused legacy loader) |

### Code changes

| File | Change |
|------|--------|
| `Adventures.jsx` | Fetch all episode files in parallel; pass structured data down |
| `Episode.jsx` | Remove `import.meta.glob` obits loading; remove `episodeId === 8` hardcode; accept new props |
| `CharacterList.jsx` | Replace status logic with `useCharacterStatuses` hook; remove suppression logic; fix backward scrub |
| `EpisodeMedia.jsx` | Accept structured `media` object instead of DSL string; add `statsUnlockAt` support |
| `EpisodeStatCounter.jsx` | No changes (receives same `alive`/`dead` props) |

---

## What Does NOT Change

- CSS animations and class names in CharacterList.css
- Sound effects and createPlayer utility
- Visual effects: blood splash, strobe revive, highlight glow, winner trophy
- Character card rendering structure
- The 550ms `displayEpisodeId` delay (needed for media crossfade)
- All other pages: Home, Cast, FAQ

---

## Removed / Cleaned Up

- `rip` array → replaced by `events`
- `reborn: true` flag → replaced by `{ action: "revive" }` events
- `videoEvents` / `slideEvents` → merged into `events`
- `storytitle`, `comment` fields → removed (same value on every episode, unused)
- `src/data/stories/index.js` → deleted
- Hardcoded `episodeId === 8` and `episodeId === 0` → use `type` field
- Hardcoded `currentVideoTime >= 26` → use `media.statsUnlockAt`
- `firedRef` Set in CharacterList → replaced by pure time-based replay

---

## Implementation Order

1. `scripts/migrate-data.js` — generate all episode JSON files
2. `Adventures.jsx` — load new files
3. `useCharacterStatuses.js` — new hook
4. `CharacterList.jsx` — use hook
5. `Episode.jsx` — use new props/format
6. `EpisodeMedia.jsx` — use structured media object
7. Delete old data files
