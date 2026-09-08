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

function Connexion() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3000/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
                'Email ou mot de passe incorrect',
        )
      }

      localStorage.setItem(
        'access_token',
        data.access_token,
      )

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data.id,
          nom: data.nom,
          email: data.email,
          role: data.role,
        }),
      )

      if (data.role === 'AGENT') {
        navigate('/agent/dashboard')
      } else if (data.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
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

          <h1>Se connecter</h1>

          <p>
            Accédez à votre espace personnel pour gérer vos réclamations.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
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
              autoComplete="current-password"
              required
            />
          </div>

          <div className="auth-options">
            <label className="remember">
              <input
                type="checkbox"
                name="remember"
              />

              <span>
                Se souvenir de moi
              </span>
            </label>

            <a href="#">
              Mot de passe oublié ?
            </a>
          </div>

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Connexion...'
              : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vous n’avez pas encore de compte ?
          </p>

          <Link to="/inscription">
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Connexion