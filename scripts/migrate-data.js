#!/usr/bin/env node
/**
 * Migration script: converts legacy data format to new episode JSON files.
 *
 * Reads:
 *   public/data/adventures.json        (episodes + media + rip + videoEvents + slideEvents)
 *   src/data/obits/{slug}.json         (Draft.js obituaries)
 *   src/data/stories/{slug}.json       (Draft.js character stories)
 *
 * Writes:
 *   public/data/episodes/{NN}_{slug}.json  (one file per episode, new format)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ─── Draft.js → plain text ───────────────────────────────────────────────────

function draftBlocksToText(blocks) {
  const paragraphs = []
  for (const block of blocks) {
    const text = block.text?.trim()
    switch (block.type) {
      case 'header-two':
      case 'header-three':
        // Character name heading — skip (redundant with heroId/characterId)
        break
      case 'image':
        // Skip — image URL is extracted separately
        break
      case 'unstyled':
        if (text) paragraphs.push(text)
        break
      case 'unordered-list-item':
        if (text) paragraphs.push('• ' + text)
        break
      case 'ordered-list-item':
        if (text) paragraphs.push(text)
        break
      case 'blockquote':
        if (text) paragraphs.push(text)
        break
      default:
        if (text) paragraphs.push(text)
    }
  }
  return paragraphs.join('\n\n')
}

function extractImageUrl(blocks) {
  const imageBlock = blocks.find(b => b.type === 'image' && b.data?.url)
  return imageBlock ? imageBlock.data.url : null
}

function convertDraftEntries(arr) {
  if (!arr || !Array.isArray(arr)) return {}
  const result = {}
  for (const entry of arr) {
    const id = String(entry.heroId)
    result[id] = {
      image: extractImageUrl(entry.blocks),
      text: draftBlocksToText(entry.blocks),
    }
  }
  return result
}

// ─── Legacy media DSL → structured object ────────────────────────────────────

function parseMediaArray(mediaArr, subtitles) {
  if (!mediaArr || mediaArr.length === 0) return { type: 'image', src: null }

  const first = mediaArr[0]

  if (first === 'tokenville') return { type: 'tokenville' }

  // Parse DSL: "video:src:cover", "image:src", "youtube:id:cover", "coub:id:cover"
  function parseSingle(str) {
    const [type, ...rest] = str.split(':')
    // re-join because URLs contain colons (https://)
    const joined = rest.join(':')
    if (type === 'image') return { type: 'image', src: joined }
    if (type === 'video') {
      const parts = joined.split(':')
      // last part is cover (no slashes), src is everything before
      // Actually split by last ':' that's before '/images'
      const coverIdx = joined.lastIndexOf(':/images/')
      if (coverIdx !== -1) {
        return { type: 'video', src: joined.slice(0, coverIdx), cover: joined.slice(coverIdx + 1) }
      }
      return { type: 'video', src: joined, cover: null }
    }
    if (type === 'youtube') {
      const [id, cover] = joined.split(':')
      return { type: 'youtube', id, cover: cover || null }
    }
    if (type === 'coub') {
      const [id, cover] = joined.split(':')
      return { type: 'coub', id, cover: cover || null }
    }
    return { type: 'image', src: str }
  }

  if (mediaArr.every(m => m.startsWith('image:'))) {
    const slides = mediaArr.map(m => m.replace(/^image:/, ''))
    const cover = slides[0]
    return { type: 'gallery', slides, cover }
  }

  const parsed = parseSingle(first)
  if (parsed.type === 'video' && subtitles?.length) {
    parsed.subtitles = subtitles
  }
  return parsed
}

// ─── Events: rip + videoEvents + slideEvents → unified events array ──────────

function buildEvents(episode) {
  const events = []
  const isPrologue = episode.id === 0

  const rip = (episode.rip || []).filter(id => id > 0)
  const videoEvents = episode.videoEvents || []
  const slideEvents = episode.slideEvents || []

  // IDs that have media-synced deaths (animation controlled by timestamp)
  const videoDeadIds = new Set(videoEvents.filter(e => e.event === 'died-now').map(e => e.characterId))
  const slideDeadIds = new Set(slideEvents.filter(e => e.event === 'died-now').map(e => e.characterId))

  // Episode-level deaths: in rip but NOT controlled by media timestamp
  const episodeLevelDeadIds = rip.filter(id => !videoDeadIds.has(id) && !slideDeadIds.has(id))

  if (episode.reborn && !isPrologue) {
    // Hard Fork: all characters revive on episode load (no video timestamp)
    if (rip.length >= 45) {
      events.push({ characters: 'all', action: 'revive' })
    } else {
      events.push({ characters: rip, action: 'revive' })
    }
  } else if (!isPrologue) {
    // Normal episode: rip = deaths
    if (episodeLevelDeadIds.length > 0) {
      events.push({ characters: episodeLevelDeadIds, action: 'die' })
    }
  }
  // Prologue: all start dead (implied by type='prologue'), revive via videoEvents at t=25

  // Video-synced deaths
  const videoDeathGroups = groupByTimeAndEvent(videoEvents, 'died-now')
  for (const [time, ids] of videoDeathGroups) {
    events.push({ characters: ids, action: 'die', at: { videoTime: time } })
  }

  // Video revives (non-prologue)
  const videoReviveGroups = groupByTimeAndEvent(videoEvents, 'reborn')
  for (const [time, ids] of videoReviveGroups) {
    if (ids.length >= 45) {
      events.push({ characters: 'all', action: 'revive', at: { videoTime: time } })
    } else {
      events.push({ characters: ids, action: 'revive', at: { videoTime: time } })
    }
  }

  // Video highlights
  const videoHighlightGroups = groupByTimeAndEvent(videoEvents, 'highlight')
  for (const [time, ids] of videoHighlightGroups) {
    events.push({ characters: ids, action: 'highlight', at: { videoTime: time } })
  }

  // Slide-synced deaths
  const slideDeathGroups = groupBySlideAndEvent(slideEvents, 'died-now')
  for (const [slide, ids] of slideDeathGroups) {
    events.push({ characters: ids, action: 'die', at: { slide } })
  }

  // Slide highlights
  const slideHighlightGroups = groupBySlideAndEvent(slideEvents, 'highlight')
  for (const [slide, ids] of slideHighlightGroups) {
    events.push({ characters: ids, action: 'highlight', at: { slide } })
  }

  // Slide winners
  const slideWinnerGroups = groupBySlideAndEvent(slideEvents, 'winner')
  for (const [slide, ids] of slideWinnerGroups) {
    events.push({ characters: ids, action: 'winner', at: { slide } })
  }

  return events
}

function groupByTimeAndEvent(eventsArr, eventType) {
  const map = new Map()
  for (const e of eventsArr) {
    if (e.event !== eventType) continue
    const key = e.time
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e.characterId)
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0])
}

function groupBySlideAndEvent(eventsArr, eventType) {
  const map = new Map()
  for (const e of eventsArr) {
    if (e.event !== eventType) continue
    const key = e.slide
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e.characterId)
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0])
}

// ─── Episode type ─────────────────────────────────────────────────────────────

function getEpisodeType(ep) {
  if (ep.id === 0) return 'prologue'
  if (ep.id === 10) return 'finale'
  return 'episode'
}

// ─── Load source files ────────────────────────────────────────────────────────

function loadJson(path) {
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8'))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const adventures = loadJson(join(root, 'public/data/adventures.json'))
const outDir = join(root, 'public/data/episodes')
mkdirSync(outDir, { recursive: true })

for (const ep of adventures) {
  const slug = ep.path
  const padded = String(ep.id).padStart(2, '0')
  const filename = `${padded}_${slug}.json`

  // Load obits and stories by episode slug
  const rawObits = loadJson(join(root, `src/data/obits/${slug}.json`))
  const rawStories = loadJson(join(root, `src/data/stories/${slug}.json`))

  const obits = convertDraftEntries(rawObits)
  const characterStories = convertDraftEntries(rawStories)

  // Parse media
  const media = parseMediaArray(ep.media, ep.subtitles)

  // Add statsUnlockAt for prologue
  if (ep.id === 0 && media.type === 'video') {
    media.statsUnlockAt = 26
  }

  // Build events
  const events = buildEvents(ep)

  // Art assets
  const art = {
    slide: ep.slide || null,
    homeSlide: ep.homeslide || null,
    background: ep.background || null,
    sharePic: ep.share_pic || null,
    map: ep.map || null,
  }

  const output = {
    id: ep.id,
    slug,
    type: getEpisodeType(ep),
    number: ep.number,
    title: ep.title,
    subtitle: ep.subtitle || '',
    story: ep.text || [],
    art,
    media,
    events,
    ...(Object.keys(obits).length > 0 ? { obits } : {}),
    ...(Object.keys(characterStories).length > 0 ? { characterStories } : {}),
  }

  const outPath = join(outDir, filename)
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8')
  console.log(`✓ ${filename}`)
}

console.log(`\nDone. ${adventures.length} episode files written to public/data/episodes/`)
