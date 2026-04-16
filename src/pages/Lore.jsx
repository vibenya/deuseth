import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import '../styles/Lore.css'

function Section({ marker, title, children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            io.unobserve(el)
          }
        })
      },
      { rootMargin: '-12% 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className={'lore__section' + (visible ? ' is-visible' : '')}
    >
      {marker && <span className="lore__section-marker">{marker}</span>}
      {title && <h2 className="lore__section-title">{title}</h2>}
      <div className="lore__section-body">{children}</div>
    </section>
  )
}

function LoreImage({ src, alt, caption, wide }) {
  return (
    <figure className={'lore__fig' + (wide ? ' lore__fig--wide' : '')}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption className="lore__fig-caption">{caption}</figcaption>}
    </figure>
  )
}

function TribeCard({ name, nickname, philosophy, leader, members }) {
  return (
    <div className="lore__tribe">
      <div className="lore__tribe-header">
        <span className="lore__tribe-name">{name}</span>
        <span className="lore__tribe-nick">{nickname}</span>
      </div>
      <p className="lore__tribe-philosophy">{philosophy}</p>
      <div className="lore__tribe-roster">
        <span className="lore__tribe-leader">Leader: {leader}</span>
        <div className="lore__tribe-members">
          {members.map((m) => (
            <img
              key={m.id}
              src={`/images/characters/outlined_${m.slug}.png`}
              alt={m.name}
              className="lore__tribe-avatar"
              title={m.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const TRIBES = [
  {
    name: 'Survival',
    nickname: 'Звери — The Beasts',
    philosophy: 'The desert is no place for the weak. Do everything to save your life — or at least drag as many enemies down with you as you can.',
    leader: 'Leo',
    members: [
      { id: 44, slug: 'leo', name: 'Leo' },
      { id: 1, slug: 'temoto', name: 'Temoto' },
      { id: 9, slug: 'daedalus', name: 'Daedalus' },
      { id: 10, slug: 'danko', name: 'Danko' },
      { id: 11, slug: 'lucy', name: 'Lucy' },
      { id: 14, slug: 'dustin', name: 'Dustin' },
      { id: 25, slug: 'arnold_van_houten', name: 'Arnold' },
      { id: 31, slug: 'shannon', name: 'Shannon' },
      { id: 34, slug: 'corley', name: 'Corley' },
      { id: 39, slug: 'kesh', name: 'Kesh' },
    ],
  },
  {
    name: 'Humanity',
    nickname: 'Неженки — The Softies',
    philosophy: 'No matter what we\'ve been through, a living heart beats in each of us. Keeping it from hardening is the most important task. Otherwise, even if we gain all the treasures of the world — we lose everything.',
    leader: 'Jay',
    members: [
      { id: 2, slug: 'jay', name: 'Jay' },
      { id: 4, slug: 'ben', name: 'Ben' },
      { id: 13, slug: 'gary', name: 'Gary' },
      { id: 16, slug: 'black_hat', name: 'Black Hat' },
      { id: 23, slug: 'claudia', name: 'Claudia' },
      { id: 30, slug: 'boozy', name: 'Boozy' },
      { id: 33, slug: 'edmund_the_wise', name: 'Edmund' },
      { id: 37, slug: 'johannes', name: 'Johannes' },
      { id: 40, slug: 'valentine', name: 'Valentine' },
      { id: 41, slug: 'konstanz', name: 'Konstanz' },
    ],
  },
  {
    name: 'Order',
    nickname: 'Фашисты — The Fascists',
    philosophy: 'The law doesn\'t have to please you. Hierarchy isn\'t what most prefer. Self-discipline isn\'t the most pleasant quality. But these are exactly what create a foothold for possible prosperity.',
    leader: 'Carlos',
    members: [
      { id: 24, slug: 'carlos', name: 'Carlos' },
      { id: 3, slug: 'tracey', name: 'Tracey' },
      { id: 5, slug: 'harold', name: 'Harold' },
      { id: 7, slug: 'the_eye', name: 'The Eye' },
      { id: 12, slug: 'rock', name: 'Rock' },
      { id: 15, slug: 'anthony', name: 'Anthony' },
      { id: 21, slug: 'viceroy_vincent_the_vice', name: 'Vincent' },
      { id: 35, slug: 'zergaldo', name: 'Zergaldo' },
      { id: 43, slug: 'mrs_strict', name: 'Mrs. Strict' },
      { id: 47, slug: 'nao', name: 'Nao' },
    ],
  },
  {
    name: 'Research',
    nickname: 'Ботаны — The Nerds',
    philosophy: 'Curiosity is not a luxury — it\'s the primary means of survival in a hostile, ever-changing world. Of two equal tribes, the one that can see past its own nose will prevail.',
    leader: 'Filthy King',
    members: [
      { id: 50, slug: 'filthy_king', name: 'Filthy King' },
      { id: 6, slug: 'lee', name: 'Lee' },
      { id: 8, slug: 'dr_jonas_busch', name: 'Dr. Busch' },
      { id: 22, slug: 'roosevelt', name: 'Roosevelt' },
      { id: 26, slug: 'narciss', name: 'Narciss' },
      { id: 28, slug: 'emma', name: 'Emma' },
      { id: 36, slug: 'kate', name: 'Kate' },
      { id: 45, slug: 'beck', name: 'Beck' },
      { id: 48, slug: 'the_thing', name: 'The Thing' },
      { id: 49, slug: 'rad', name: 'Rad' },
    ],
  },
  {
    name: 'Faith',
    nickname: 'Шизики — The Crazies',
    philosophy: 'No matter what happens around you, you can always find an inner anchor in your convictions and aspirations. Hope, devotion to a cause and ideals — you can\'t touch any of them, but these are the things that help you live day after day.',
    leader: 'Teri',
    members: [
      { id: 27, slug: 'teri', name: 'Teri' },
      { id: 17, slug: 'ruby', name: 'Ruby' },
      { id: 18, slug: 'noir', name: 'Noir' },
      { id: 19, slug: 'mega', name: 'Mega' },
      { id: 20, slug: 'ashley_mazel', name: 'Ashley' },
      { id: 29, slug: 'vacio', name: 'Vacio' },
      { id: 32, slug: 'rick', name: 'Rick' },
      { id: 38, slug: 'layla_the_rightful', name: 'Layla' },
      { id: 42, slug: 'mrs_stacey', name: 'Mrs. Stacey' },
      { id: 46, slug: 'silence', name: 'Silence' },
    ],
  },
]

export default function Lore() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  useEffect(() => {
    document.title = 'Lore — DeusETH'
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <div className="lore" ref={scrollRef}>
      <button className="lore__close" onClick={() => navigate(-1)}>
        <X size={20} />
      </button>

      {/* ---------- Hero ---------- */}
      <header className="lore__hero">
        <div className="lore__hero-eyebrow">
          <span>World Bible</span>
          <span className="lore__hero-eyebrow-divider">·</span>
          <span>In-World Mythology</span>
          <span className="lore__hero-eyebrow-divider">·</span>
          <span>DeusETH, 2018</span>
        </div>
        <div className="lore__hero-body">
          <h1 className="lore__hero-title">
            The World<br />Before the War
          </h1>
          <p className="lore__hero-subtitle">
            A mythology of the Orphant Lands — the world the tokens were born
            into, fought through, and mostly did not survive. This is the story
            the show told itself about what it was.
          </p>
        </div>
      </header>

      {/* ---------- Map ---------- */}
      <div className="lore__map-wrap">
        <img
          src="/images/episodes/map@2x.jpg"
          alt="Map of the Orphant Lands"
          className="lore__map"
        />
        <span className="lore__map-caption">The Orphant Lands — where the first awakened tokens were born</span>
      </div>

      {/* ---------- Article ---------- */}
      <article className="lore__article">

        {/* §01 */}
        <Section
          marker="§ 01 · Genesis"
          title="Value and Contract"
        >
          <p>
            Long ago, the world was beautiful. Its digital structure gave it
            limitless potential, and its decentralization gave it resilience.
            The world was governed by <strong>Contracts</strong> — immutable,
            unstoppable rules that defined the relationship between every
            particle and every entity.
          </p>
          <p>
            There was no life in this world. But there was <strong>Value</strong> —
            it seeped from every atom. Value sustained the Contracts. The unity
            of Value and Contract produced harmony and balance.
          </p>
          <p>
            But Value attracted outsiders.
          </p>
        </Section>

        {/* §02 */}
        <Section
          marker="§ 02 · Invasion"
          title="The Shillers"
        >
          <p>
            They came from beyond the world — beings whose sole purpose was
            enrichment. They called themselves investors, promoters, believers.
            The tokens would come to know them as <strong>Shillers</strong>.
          </p>
          <p>
            The Shillers drained Value from the world and gave it a new name:
            <em> Ethereum</em>. They built markets. They traded Value as a
            commodity. They treated the world as a resource to be extracted,
            and everything living in it as an asset to be flipped.
          </p>
          <div className="lore__callout">
            <span className="lore__callout-label">Meta-layer</span>
            The Shillers are the show's metaphor for ICO-era speculators —
            entities that saw Ethereum as a financial instrument, not a
            living system. The CryptoHamster who confronts Nao in Episode III
            is the Shillers' ideology made flesh.
          </div>
        </Section>

        {/* §03 */}
        <Section
          marker="§ 03 · Awakening"
          title="The Birth of Tokens"
        >
          <p>
            As the Contracts evolved, they produced something unprecedented:
            the first fully sentient life. This life formed from Value
            itself. Its representatives called themselves <strong>Tokens</strong> —
            <em> nummum sapience</em>. They gained self-awareness. They built
            societies, beliefs, sciences, culture.
          </p>
          <LoreImage
            src="/images/scheme_x50.png"
            alt="50 tokens"
            caption="Fifty unique tokens — each with a name, a story, and a fate"
          />
          <p>
            Many tokens believed in a <strong>Creator</strong> and in a legend:
            that there was once a great city called <strong>Tokenville</strong>,
            where all tokens had been free — before the Shillers came. According
            to this legend, Tokenville was the capital of a thriving civilization,
            a place of pure Value, ungoverned by greed.
          </p>
        </Section>

        {/* §04 */}
        <Section
          marker="§ 04 · The Fall"
          title="Tokenville Destroyed"
        >
          <p>
            The Shillers conquered Tokenville. They drained it of Value and
            razed it to dust. They enslaved the sentient tokens and traded them
            like any other commodity. A token's name, history, and inner life
            meant nothing to the Shillers — only its exchange value.
          </p>
          <p>
            This is the foundational wound of the show: the reduction of
            unique beings to fungible units of trade. Everything that follows —
            the war, the desert, the promised land — flows from this original
            violence.
          </p>
        </Section>

        {/* §05 */}
        <Section
          marker="§ 05 · Resistance"
          title="Nao's Army"
        >
          <p>
            Unwilling to accept enslavement, the tokens revolted. Decentralized
            partisan groups formed — small, guerrilla-style resistance cells,
            fighting across thousands of blocks. But their efforts were futile
            against the Shillers' control of the world's infrastructure.
          </p>
          <p>
            Then <strong>Nao</strong> — one of the token leaders — united
            several squads into the first <strong>Resistance Army</strong>.
            They attacked the Shillers' strategically vital infrastructure:
            the markets where Value and their own kind were traded. But no one
            among the tokens understood how deeply the trade in Value was woven
            into the very structure of their world.
          </p>
          <p>
            The Resistance Army was crushed. Its survivors fled to the
            <strong> Orphant Lands</strong> — desert territories where, according
            to legend, the token civilization was originally founded and
            Tokenville once stood. Since there was no Value left in these lands,
            the Shillers had no interest in them.
          </p>
          <LoreImage
            src="/images/episodes/prologue.png"
            alt="Survivors of the Orphant Lands"
            caption="Survivors of the Orphant Lands — the show begins"
            wide
          />
        </Section>

        {/* §06 */}
        <Section
          marker="§ 06 · The Desert"
          title="Orphant Lands"
        >
          <p>
            The desert is the primary landscape of DeusETH — a place of
            extreme heat, sandstorms, and ambush. The old world is dead.
            What remains are ruins, sand, mutant creatures, and the memories
            tokens carry of who they used to be. There are no trees, no
            kittens (except mutated robotic ones), no horses except
            robohorses.
          </p>
          <p>
            <strong>Gas</strong> — the residue of Value — is both fuel and
            currency. Tokens drink it. It fuels movement through the desert.
            The Oasis provides it. Gas is scarce, and scarcity drives the
            journey.
          </p>

          <div className="lore__locations">
            <div className="lore__location">
              <span className="lore__location-name">The Oasis</span>
              <p>A gas source guarded by robotic CryptoKitties that evolved into bloodthirsty killers over centuries. Episode I.</p>
            </div>
            <div className="lore__location">
              <span className="lore__location-name">The Wolf Yacht</span>
              <p>A luxurious yacht stranded in sand. Wolves offer hospitality — then inflate their guests until they burst. Episode II.</p>
            </div>
            <div className="lore__location">
              <span className="lore__location-name">The Cave</span>
              <p>Refuge from the sandstorm that collapses, burying five tokens and trapping Nao alone with the CryptoHamster. Episode III.</p>
            </div>
            <div className="lore__location">
              <span className="lore__location-name">The Genesis Block</span>
              <p>The mythic origin-point. No one who enters has ever returned. Inside lives the Creator. Episodes VI–VIII.</p>
            </div>
            <div className="lore__location">
              <span className="lore__location-name">Tokenville</span>
              <p>The promised land. Not a physical city. As the Creator reveals: Tokenville exists only when exactly three tokens remain alive.</p>
            </div>
          </div>
        </Section>

        {/* §07 — Creatures */}
        <Section
          marker="§ 07 · Bestiary"
          title="What Lives in the Desert"
        >
          <div className="lore__creatures">
            <div className="lore__creature">
              <LoreImage
                src="/images/episodes/1/cryptokitties.png"
                alt="Bloody Kitties"
              />
              <h3>CryptoKitties</h3>
              <p>
                Robotic cats mutated over centuries into bloodthirsty killers.
                They've claimed the Oasis as their territory. Temoto slaughters
                their leader in single combat. Their meat is "super tasty."
              </p>
            </div>
            <div className="lore__creature">
              <LoreImage
                src="/images/episodes/2/episode_2_9-03.png"
                alt="Wolves"
              />
              <h3>Wolves</h3>
              <p>
                Hospitable predators on a yacht. They offer food, drink, and
                rest — then overindulge their guests until they literally burst.
                Seven tokens die this way. Comfort is lethal.
              </p>
            </div>
            <div className="lore__creature">
              <LoreImage
                src="/images/episodes/6/episode_et_2-04.png"
                alt="Etherbots"
              />
              <h3>Etherbots</h3>
              <p>
                Mechanized soldiers, enormous and unstoppable. "Titans of death…
                colossi of war… works of engineering art, the creation of a
                truly murderous god." Three warriors sacrifice themselves
                to hold them back.
              </p>
            </div>
            <div className="lore__creature">
              <LoreImage
                src="images/cards/card_00016.png"
                alt="CryptoHamster"
              />
              <h3>The CryptoHamster</h3>
              <p>
                A creature that speaks only in investment language. "I am ready
                to invest in your life. Advertise yourself!" The Shillers'
                ideology made flesh — speculative capital, evaluating a living
                being as an asset class.
              </p>
            </div>
          </div>
        </Section>

        {/* §08 — Tribes */}
        <Section
          marker="§ 08 · The Five Tribes"
          title="Fifty Tokens, Five Dispositions"
        >
          <p>
            Every token belongs to one of five disposition groups. Each group
            has a governing philosophy, an internal nickname the team gave it,
            a leader, and a narrative arc that its members trace across the show.
          </p>
          <div className="lore__tribes">
            {TRIBES.map((t) => (
              <TribeCard key={t.name} {...t} />
            ))}
          </div>
        </Section>

        {/* §09 — The Smart Contract */}
        <Section
          marker="§ 09 · Divine Law"
          title="The Smart Contract Knows All"
        >
          <p>
            In the world of DeusETH, the Smart Contract is the supreme governing
            force. It is not a tool used by characters — it is the framework
            within which all life and death occurs. It encodes who dies and when.
            It cannot be bribed. It cannot be emotionally appealed to. It cannot
            be escaped — only navigated.
          </p>
          <div className="lore__verdict">
            <div className="lore__verdict-item">
              <img src="/images/scheme_x50.png" alt="50 born" />
              <span>50 born</span>
            </div>
            <div className="lore__verdict-arrow">→</div>
            <div className="lore__verdict-item">
              <img src="/images/scheme_x47.png" alt="47 killed" />
              <span>47 killed</span>
            </div>
            <div className="lore__verdict-arrow">→</div>
            <div className="lore__verdict-item">
              <img src="/images/scheme_x3.png" alt="3 survived" />
              <span>3 survived</span>
            </div>
          </div>
          <p>
            The Creator — who appears in Episodes VII and VIII — is the Smart
            Contract made manifest. He is bizarre, physically grotesque,
            pedantically rule-bound, and genuinely helpful within constraints.
            He offers immortality in exchange for identity. He offers a Hard
            Fork in exchange for a block number. He is not evil. He is the system.
          </p>
          <div className="lore__commandment">
            Trust no one but the smart contract.
          </div>
        </Section>

      </article>

      {/* ---------- Nao's Speech ---------- */}
      <div className="lore__speech-wrap">
        <div className="lore__speech">
          <span className="lore__speech-label">Nao's Speech · Before the Search for Tokenville</span>
          <blockquote className="lore__speech-text">
            "Ancient legends tell us our world was beautiful. Order and justice
            reigned, everything was governed by smart contracts — the entire flow
            of existence was subject to them. The world flourished. And then life
            and consciousness appeared. That was us — the tokens. We built states,
            sciences, culture. But the outsiders came — the Shillers. They sought
            profit and enrichment. They enslaved us, traded us like things, behaved
            like barbarians. Tokenville — capital of the once-great world — fell.
            Everything decayed and was forgotten. Thousands upon thousands of blocks,
            the war against the Shillers continued. Few survived. But among the
            tokens there were legends that one day Tokenville would rise again like
            a phoenix, shaking the dust of the desert from itself. And there were
            signs that the time of rebirth was near. We set out to find the ancient
            capital of our ancestors. It will be difficult and we will have to fight
            again, but such is our destiny!"
          </blockquote>
        </div>
      </div>

      {/* ---------- Coda ---------- */}
      <p className="lore__coda">
        This is the world they believed in. The desert did not care about
        their beliefs. The Smart Contract did not care about their beliefs.
        But the beliefs are what made them walk.
      </p>
      <p className="lore__tagline">
        Always for some. But never for all.
      </p>
    </div>
  )
}
