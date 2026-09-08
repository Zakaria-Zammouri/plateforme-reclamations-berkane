import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function Logo() {
  return (
    <div className="brand-logo" aria-label="Logo SAWTI">
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

function Inscription() {
  const navigate = useNavigate()

  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3000/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom,
            email,
            password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
                'Impossible de créer le compte.',
        )
      }

      setSuccess(
        'Votre compte a été créé avec succès.',
      )

      setTimeout(() => {
        navigate('/connexion')
      }, 1200)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link
            to="/"
            className="auth-logo"
            aria-label="Retour à l'accueil"
          >
            <Logo />
          </Link>

          <h1>Créer un compte</h1>

          <p>
            Créez votre compte citoyen pour déposer et suivre vos
            réclamations.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="nom">
              Nom complet
            </label>

            <input
              id="nom"
              name="nom"
              type="text"
              value={nom}
              onChange={(event) =>
                setNom(event.target.value)
              }
              placeholder="Votre nom complet"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Adresse e-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="exemple@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Mot de passe
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Votre mot de passe"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirmez votre mot de passe"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-success"
              role="status"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Création...'
              : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?
          </p>

          <Link to="/connexion">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Inscription
