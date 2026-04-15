const EPISODE_SLUGS = [
  '00_prologue', '01_bloody_kitties', '02_wolf_party', '03_freedom_to_die',
  '04_redrum', '05_murder', '06_the_final_battle', '07_scam',
  '08_hard_fork', '09_tokencide', '10_episode-x',
]

export function fetchAllEpisodes() {
  return Promise.all(
    EPISODE_SLUGS.map(s => fetch(`/data/episodes/${s}.json`).then(r => r.json()))
  )
}
