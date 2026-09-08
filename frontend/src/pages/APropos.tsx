import { Link } from 'react-router-dom'
import '../App.css'

function AboutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <circle
        cx="12"
        cy="7"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12l4 4L19 6" />
    </svg>
  )
}

function About() {
  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — COMMUNE DE BERKANE
            </span>

            <h1>
              À propos de SAWTI
            </h1>

            <p>
              Votre voix, notre engagement.
            </p>
          </div>

          <Link
            to="/"
            className="btn btn-outline"
          >
            Accueil
          </Link>
        </header>

        <section className="dashboard-info">
          <article className="dashboard-info-card">
            <div className="dashboard-card-icon green">
              <AboutIcon />
            </div>

            <div>
              <h2>
                SAWTI — Votre voix compte
              </h2>

              <p>
                SAWTI est la plateforme numérique de
                gestion des réclamations de la Commune
                de Berkane.
              </p>

              <p>
                Elle permet aux citoyens de déposer
                leurs réclamations en ligne, de suivre
                leur traitement et de consulter leur
                évolution de manière simple,
                transparente et sécurisée.
              </p>
            </div>
          </article>
        </section>

        <section className="reclamations-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-eyebrow">
                NOTRE OBJECTIF
              </span>

              <h2>
                Simplifier la relation avec le citoyen
              </h2>

              <p>
                Une démarche numérique pensée pour
                rendre le suivi des réclamations plus
                simple et plus accessible.
              </p>
            </div>
          </div>

          <div className="dashboard-info">
            <article className="dashboard-info-card">
              <div className="dashboard-card-icon green">
                <CheckIcon />
              </div>

              <div>
                <h2>
                  Déposer une réclamation
                </h2>

                <p>
                  Déposez votre demande en ligne avec
                  les informations nécessaires et,
                  lorsque cela est utile, les documents
                  justificatifs.
                </p>
              </div>
            </article>

            <article className="dashboard-info-card">
              <div className="dashboard-card-icon green">
                <CheckIcon />
              </div>

              <div>
                <h2>
                  Suivre son traitement
                </h2>

                <p>
                  Consultez à tout moment l'état
                  d'avancement de votre réclamation depuis
                  votre espace citoyen.
                </p>
              </div>
            </article>

            <article className="dashboard-info-card">
              <div className="dashboard-card-icon green">
                <CheckIcon />
              </div>

              <div>
                <h2>
                  Consulter l'historique
                </h2>

                <p>
                  Retrouvez les différentes étapes du
                  traitement de votre réclamation dans
                  votre espace personnel.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="reclamations-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-eyebrow">
                UNE DÉMARCHE PLUS TRANSPARENTE
              </span>

              <h2>
                Un suivi clair et organisé
              </h2>

              <p>
                Chaque réclamation suit un processus de
                traitement permettant au citoyen de
                connaître son état d'avancement.
              </p>
            </div>
          </div>

          <div className="dashboard-info">
            <article className="dashboard-info-card">
              <div>
                <h2>
                  En attente
                </h2>

                <p>
                  La réclamation a été enregistrée et
                  attend sa prise en charge.
                </p>
              </div>
            </article>

            <article className="dashboard-info-card">
              <div>
                <h2>
                  En cours
                </h2>

                <p>
                  La réclamation est en cours de
                  traitement par le service concerné.
                </p>
              </div>
            </article>

            <article className="dashboard-info-card">
              <div>
                <h2>
                  Traitée ou rejetée
                </h2>

                <p>
                  Une décision a été prise concernant la
                  réclamation.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="dashboard-info">
          <article className="dashboard-info-card">
            <div>
              <span className="dashboard-eyebrow">
                NOTRE ENGAGEMENT
              </span>

              <h2>
                Un service public à l'écoute
              </h2>

              <p>
                La Commune de Berkane s'inscrit dans une
                démarche de modernisation et de
                digitalisation des services afin de
                faciliter l'accès des citoyens à
                l'administration communale.
              </p>

              <p>
                SAWTI contribue à cette démarche en
                proposant un espace numérique accessible,
                organisé et sécurisé pour le dépôt et le
                suivi des réclamations.
              </p>

              <div className="dashboard-actions">
                <Link
                  to="/inscription"
                  className="btn btn-primary"
                >
                  Créer mon compte
                </Link>

                <Link
                  to="/contact"
                  className="btn btn-outline"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </article>
        </section>

        <footer className="dashboard-footer">
          <p>
            SAWTI — Commune de Berkane
          </p>

          <p>
            Votre voix, notre engagement.
          </p>
        </footer>
      </div>
    </main>
  )
}

export default About