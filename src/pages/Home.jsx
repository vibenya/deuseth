import Hero from '../components/Hero'
import Intro from '../components/Intro'
import Comix from '../components/Comix'
import EpisodesList from '../components/EpisodesList'
import Feedback from '../components/Feedback'
import Lineup from '../components/Lineup'
import Featured from '../components/Featured'

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Comix />
      <EpisodesList />
      <Feedback />
      <Lineup />
      <Featured />
    </>
  )
}
