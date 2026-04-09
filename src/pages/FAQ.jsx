import { useState } from 'react'
import faqData from '../data/faq.json'
import '../styles/FAQ.css'

// FAQ data is static JSON bundled with the app (not user input), safe to render as HTML
export default function FAQ() {
  const [openItems, setOpenItems] = useState({})

  const toggle = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="faq">
      <div className="faq__inner">
        <h1 className="faq__title">FAQ</h1>

        {faqData.map((section, si) => (
          <div key={si} className="faq__part">
            <h2 className="faq__subtitle">{section.title}</h2>

            {section.items.map((item, qi) => {
              const key = `${si}-${qi}`
              const isOpen = !!openItems[key]

              return (
                <div key={key} className="faq__item">
                  <div
                    className={`faq__sub${isOpen ? ' faq__sub--open' : ''}`}
                    onClick={() => toggle(key)}
                  >
                    {item.question}
                  </div>
                  <div className={`faq__text${isOpen ? ' faq__text--open' : ''}`}>
                    {item.text.map((para, pi) => (
                      <p
                        key={pi}
                        className="faq__para"
                        dangerouslySetInnerHTML={{ __html: para }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
