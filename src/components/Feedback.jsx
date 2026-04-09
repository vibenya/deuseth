import '../styles/Feedback.css'

export default function Feedback() {
  return (
    <section className="feedback">
      <div className="feedback__inner">
        <div className="feedback__top">
          <div className="feedback__cite">
            <span>&ldquo;</span>
            <p>A beautiful experiment on the frontier of blockchain storytelling.</p>
            <span>&rdquo;</span>
          </div>
          <div className="feedback__name">Nate</div>
        </div>
        <div className="feedback__guys">
          <div className="feedback__guy">
            <div className="feedback__cite">
              <span>&ldquo;</span>
              <p>I bought a token on a whim and ended up obsessed with the story of my character.</p>
              <span>&rdquo;</span>
            </div>
            <div className="feedback__name">ForkU</div>
          </div>
          <div className="feedback__guy">
            <div className="feedback__cite">
              <span>&ldquo;</span>
              <p>My character Arnold Van Houten died in Episode 3 but I still couldn't stop reading.</p>
              <span>&rdquo;</span>
            </div>
            <div className="feedback__name">Dean as Arnold Van Houten</div>
          </div>
          <div className="feedback__guy">
            <div className="feedback__cite">
              <span>&ldquo;</span>
              <p>Konstanz survived! The smartest investment I ever made was a cartoon character.</p>
              <span>&rdquo;</span>
            </div>
            <div className="feedback__name">Sergey as Konstanz</div>
          </div>
        </div>
      </div>
    </section>
  )
}
