import { Link } from 'react-router-dom'
import '../App.css'

function Logo() {
  return (
    <div
      className="brand-logo"
      aria-label="Logo SAWTI"
    >
      <svg
        viewBox="0 0 64 64"
        className="brand-icon"
        role="img"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r="29"
          className="logo-circle"
        />

        <path
          d="M20 25h7l15-8v30l-15-8h-7z"
          className="logo-megaphone"
        />

        <path
          d="M42 24c4 2 6 5 6 8s-2 6-6 8"
          className="logo-wave"
        />

        <path
          d="M18 44h10"
          className="logo-base"
        />
      </svg>

      <div className="brand-text">
        <strong>SAWTI</strong>
        <span>Commune de Berkane</span>
      </div>
    </div>
  )
}

function Accueil() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="container nav-wrapper">
          <Link
            to="/"
            className="brand"
            aria-label="Accueil SAWTI"
          >
            <Logo />
          </Link>

          <nav className="navigation">
            <Link
              to="/"
              className="nav-link active"
            >
              Accueil
            </Link>

            <Link
              to="/a-propos"
              className="nav-link"
            >
              À propos
            </Link>

            <Link
              to="/contact"
              className="nav-link"
            >
              Contact
            </Link>
          </nav>

          <div className="nav-actions">
            <Link
              to="/connexion"
              className="btn btn-outline"
            >
              Se connecter
            </Link>

            <Link
              to="/inscription"
              className="btn btn-primary"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-pattern hero-pattern-left" />
          <div className="hero-pattern hero-pattern-right" />

          <div className="container hero-content">
            <div className="hero-copy">
              <div className="hero-logo">
                <Logo />
              </div>

              <p className="eyebrow">
                Commune de Berkane
              </p>

              <h1>
                Votre voix, notre action
              </h1>

              <p className="hero-description">
                La plateforme officielle de gestion
                des réclamations et suggestions pour
                une commune plus proche, plus réactive
                et plus efficace.
              </p>

              <div className="hero-actions">
                <Link
                  to="/connexion"
                  className="btn btn-primary btn-large"
                >
                  Déposer une réclamation
                </Link>

                <Link
                  to="/a-propos"
                  className="btn btn-outline btn-large"
                >
                  En savoir plus
                </Link>
              </div>
            </div>

            <div
              className="hero-illustration"
              aria-hidden="true"
            >
              <div className="city-sun" />

              <div className="cityscape">
                <div className="tower">
                  <div className="tower-top" />

                  <div className="tower-body" />

                  <div className="tower-door" />
                </div>

                <div className="building building-one" />
                <div className="building building-two" />
                <div className="building building-three" />
                <div className="building building-four" />

                <div className="palm palm-one">
                  <span className="trunk" />
                  <span className="leaves" />
                </div>

                <div className="palm palm-two">
                  <span className="trunk" />
                  <span className="leaves" />
                </div>

                <div className="mountain" />

                <div className="ground" />
              </div>
            </div>
          </div>

          <div className="waves">
            <div className="wave wave-blue" />
            <div className="wave wave-orange" />
          </div>
        </section>

        <section
          className="features"
          id="fonctionnement"
        >
          <div className="container features-grid">
            <article className="feature-card">
              <div className="feature-icon feature-blue">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M5 5h14v14H5z" />
                  <path d="M8 9h8M8 13h6M8 17h4" />
                </svg>
              </div>

              <div>
                <h3>
                  Simple
                </h3>

                <p>
                  Déposez votre réclamation en quelques
                  clics.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <div className="feature-icon feature-orange">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                  />

                  <path d="M12 8v5l3 2" />
                </svg>
              </div>

              <div>
                <h3>
                  Suivi en temps réel
                </h3>

                <p>
                  Suivez votre réclamation à tout
                  moment.
                </p>
              </div>
            </article>

            <article className="feature-card">
              <div className="feature-icon feature-green">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8M8 13h8M8 17h4" />
                </svg>
              </div>

              <div>
                <h3>
                  Commune connectée
                </h3>

                <p>
                  Pour une meilleure qualité de vie à
                  Berkane.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <article className="feature-card">
              <div>
                <h3>
                  Une plateforme à votre service
                </h3>

                <p>
                  SAWTI facilite le dépôt, le suivi et
                  la gestion des réclamations citoyennes
                  auprès de la Commune de Berkane.
                </p>

                <div className="hero-actions">
                  <Link
                    to="/a-propos"
                    className="btn btn-outline"
                  >
                    Découvrir SAWTI
                  </Link>

                  <Link
                    to="/contact"
                    className="btn btn-primary"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer
        className="footer"
        id="contact"
      >
        <div className="container footer-content">
          <div className="footer-brand">
            <Link
              to="/"
              className="brand"
              aria-label="Accueil SAWTI"
            >
              <Logo />
            </Link>
          </div>

          <div className="footer-center">
            © 2026 SAWTI — Commune de Berkane.
            Tous droits réservés.
          </div>

          <div className="socials">
         
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Accueil