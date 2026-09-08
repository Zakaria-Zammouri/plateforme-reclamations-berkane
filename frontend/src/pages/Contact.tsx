import {
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import '../App.css'

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M7 3h3l2 5-2 2c1 2 2 3 4 4l2-2 5 2v3c0 1-1 2-2 2C10 19 5 14 5 5c0-1 1-2 2-2z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.2" />
    </svg>
  )
}

function Contact() {
  const [
    nom,
    setNom,
  ] = useState('')

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    objet,
    setObjet,
  ] = useState('')

  const [
    message,
    setMessage,
  ] = useState('')

  const [
    success,
    setSuccess,
  ] = useState(false)

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setSuccess(true)

    setNom('')
    setEmail('')
    setObjet('')
    setMessage('')
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — COMMUNE DE BERKANE
            </span>

            <h1>
              Contact
            </h1>

            <p>
              Une question ? La Commune est à votre écoute.
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
              <LocationIcon />
            </div>

            <div>
              <span className="dashboard-eyebrow">
                ADRESSE
              </span>

              <h2>
                Commune de Berkane
              </h2>

              <p>
                Berkane, Maroc
              </p>
            </div>
          </article>

          <article className="dashboard-info-card">
            <div className="dashboard-card-icon green">
              <PhoneIcon />
            </div>

            <div>
              <span className="dashboard-eyebrow">
                TÉLÉPHONE
              </span>

              <h2>
                Contact téléphonique
              </h2>

              <p>
                Coordonnées officielles à compléter.
              </p>
            </div>
          </article>

          <article className="dashboard-info-card">
            <div className="dashboard-card-icon green">
              <EmailIcon />
            </div>

            <div>
              <span className="dashboard-eyebrow">
                EMAIL
              </span>

              <h2>
                Adresse électronique
              </h2>

              <p>
                Adresse officielle à compléter.
              </p>
            </div>
          </article>
        </section>

        <section className="reclamations-section">
          <div className="section-heading">
            <div>
              <span className="dashboard-eyebrow">
                NOUS ÉCRIRE
              </span>

              <h2>
                Envoyer un message
              </h2>

              <p>
                Utilisez ce formulaire pour nous adresser
                une question concernant la plateforme ou
                vos démarches.
              </p>
            </div>
          </div>

          {success && (
            <div
              className="dashboard-message"
              role="status"
            >
              Votre message a été enregistré avec succès.
              Une réponse pourra être apportée par le
              service concerné.
            </div>
          )}

          <form
            className="detail-card"
            onSubmit={handleSubmit}
          >
            <div className="detail-section">
              <h3>
                Vos coordonnées
              </h3>

              <div className="detail-grid">
                <div>
                  <label htmlFor="nom">
                    Nom et prénom
                  </label>

                  <input
                    id="nom"
                    type="text"
                    value={nom}
                    onChange={(
                      event,
                    ) =>
                      setNom(
                        event.target.value,
                      )
                    }
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">
                    Adresse e-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>
                Votre demande
              </h3>

              <div className="detail-grid">
                <div>
                  <label htmlFor="objet">
                    Objet
                  </label>

                  <select
                    id="objet"
                    value={objet}
                    onChange={(
                      event,
                    ) =>
                      setObjet(
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="">
                      Choisissez un sujet
                    </option>

                    <option value="plateforme">
                      Utilisation de la plateforme
                    </option>

                    <option value="reclamation">
                      Suivi d'une réclamation
                    </option>

                    <option value="compte">
                      Problème de compte
                    </option>

                    <option value="autre">
                      Autre demande
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  marginTop:
                    '1rem',
                }}
              >
                <label htmlFor="message">
                  Message
                </label>

                <textarea
                  id="message"
                  value={message}
                  onChange={(
                    event,
                  ) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  placeholder="Décrivez votre demande..."
                  rows={7}
                  required
                />
              </div>
            </div>

            <div className="dashboard-actions">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Envoyer le message
              </button>

              <Link
                to="/"
                className="btn btn-outline"
              >
                Annuler
              </Link>
            </div>

            <p className="detail-empty">
              Les informations transmises via ce formulaire
              sont utilisées uniquement pour répondre à votre
              demande.
            </p>
          </form>
        </section>

        <section className="dashboard-info">
          <article className="dashboard-info-card">
            <div>
              <span className="dashboard-eyebrow">
                BESOIN D'AIDE ?
              </span>

              <h2>
                Concernant une réclamation déjà déposée
              </h2>

              <p>
                Pensez à indiquer votre numéro de classement
                lorsque vous contactez la Commune. Vous
                pouvez également consulter votre espace
                citoyen afin de suivre directement l'état de
                votre réclamation.
              </p>

              <div className="dashboard-actions">
                <Link
                  to="/connexion"
                  className="btn btn-primary"
                >
                  Mon espace citoyen
                </Link>

                <Link
                  to="/a-propos"
                  className="btn btn-outline"
                >
                  À propos de SAWTI
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

export default Contact