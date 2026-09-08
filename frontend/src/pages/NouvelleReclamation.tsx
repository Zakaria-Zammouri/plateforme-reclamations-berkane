import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

type FormData = {
  numeroBureauOrdre: string
  dateBureauOrdre: string
  dateReception: string
  departement: string
  service: string
  misEnCause: string
  titre: string
  description: string
  priorite: string
}

function NouvelleReclamation() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    numeroBureauOrdre: '',
    dateBureauOrdre: '',
    dateReception: '',
    departement: '',
    service: '',
    misEnCause: '',
    titre: '',
    description: '',
    priorite: 'NORMALE',
  })

  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleFiles(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (!event.target.files) {
      return
    }

    setFiles(Array.from(event.target.files))
  }

  async function uploadFiles(
    reclamationId: number,
    token: string,
  ) {
    for (const file of files) {
      const formDataUpload = new FormData()

      formDataUpload.append('file', file)

      const response = await fetch(
        `http://localhost:3000/reclamations/${reclamationId}/fichiers`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
                `Impossible d'envoyer le fichier ${file.name}.`,
        )
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/connexion')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3000/reclamations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            numeroBureauOrdre:
              formData.numeroBureauOrdre || undefined,

            dateBureauOrdre:
              formData.dateBureauOrdre || undefined,

            dateReception:
              formData.dateReception || undefined,

            departement:
              formData.departement || undefined,

            service:
              formData.service || undefined,

            misEnCause:
              formData.misEnCause || undefined,

            titre:
              formData.titre || undefined,

            description:
              formData.description || undefined,

            priorite:
              formData.priorite || 'NORMALE',
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
                'Impossible de créer la réclamation.',
        )
      }

      if (files.length > 0) {
        await uploadFiles(data.id, token)
      }

      setSuccess(
        `Réclamation #${data.numeroClassement} créée avec succès.`,
      )

      setTimeout(() => {
        navigate('/dashboard')
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
    <main className="reclamation-form-page">
      <div className="reclamation-form-container">
        <div className="reclamation-form-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — NOUVELLE RÉCLAMATION
            </span>

            <h1>Déposer une réclamation</h1>

            <p>
              Remplissez les informations ci-dessous afin de
              transmettre votre réclamation à la Commune de Berkane.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="btn btn-outline"
          >
            Retour au dashboard
          </Link>
        </div>

        <form
          className="reclamation-form-card"
          onSubmit={handleSubmit}
        >
          <section className="form-section">
            <div className="form-section-heading">
              <span>01</span>

              <div>
                <h2>
                  Informations du bureau d'ordre
                </h2>

                <p>
                  Les informations administratives disponibles
                  concernant la réception de votre réclamation.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="numeroBureauOrdre">
                  Numéro du bureau d'ordre
                </label>

                <input
                  id="numeroBureauOrdre"
                  name="numeroBureauOrdre"
                  type="text"
                  value={formData.numeroBureauOrdre}
                  onChange={handleChange}
                  placeholder="Ex. BO-001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateBureauOrdre">
                  Date du bureau d'ordre
                </label>

                <input
                  id="dateBureauOrdre"
                  name="dateBureauOrdre"
                  type="date"
                  value={formData.dateBureauOrdre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateReception">
                  Date de réception
                </label>

                <input
                  id="dateReception"
                  name="dateReception"
                  type="date"
                  value={formData.dateReception}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span>02</span>

              <div>
                <h2>
                  Service concerné
                </h2>

                <p>
                  Indiquez le département et le service concernés
                  par votre réclamation.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="departement">
                  Département concerné
                </label>

                <input
                  id="departement"
                  name="departement"
                  type="text"
                  value={formData.departement}
                  onChange={handleChange}
                  placeholder="Ex. Services techniques"
                />
              </div>

              <div className="form-group">
                <label htmlFor="service">
                  Service concerné
                </label>

                <input
                  id="service"
                  name="service"
                  type="text"
                  value={formData.service}
                  onChange={handleChange}
                  placeholder="Ex. Éclairage public"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="misEnCause">
                  Mis en cause <span>(si applicable)</span>
                </label>

                <input
                  id="misEnCause"
                  name="misEnCause"
                  type="text"
                  value={formData.misEnCause}
                  onChange={handleChange}
                  placeholder="Personne ou entité concernée"
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span>03</span>

              <div>
                <h2>
                  Votre réclamation
                </h2>

                <p>
                  Décrivez clairement le problème afin de faciliter
                  son traitement.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="titre">
                  Titre de la réclamation
                </label>

                <input
                  id="titre"
                  name="titre"
                  type="text"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Résumez votre réclamation en quelques mots"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priorite">
                  Priorité
                </label>

                <select
                  id="priorite"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleChange}
                  required
                >
                  <option value="BASSE">
                    Basse
                  </option>

                  <option value="NORMALE">
                    Normale
                  </option>

                  <option value="HAUTE">
                    Haute
                  </option>

                  <option value="URGENTE">
                    Urgente
                  </option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre problème, les circonstances et les détails utiles..."
                  rows={7}
                  required
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span>04</span>

              <div>
                <h2>
                  Fichiers joints
                </h2>

                <p>
                  Vous pouvez joindre des documents utiles à votre
                  réclamation.
                </p>
              </div>
            </div>

            <div className="upload-zone">
              <input
                id="files"
                name="files"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFiles}
              />

              <label htmlFor="files">
                <strong>
                  Cliquez pour sélectionner vos fichiers
                </strong>

                <span>
                  PDF, JPG, JPEG ou PNG
                </span>
              </label>

              {files.length > 0 && (
                <div className="selected-files">
                  <strong>
                    {files.length} fichier
                    {files.length > 1 ? 's' : ''}{' '}
                    sélectionné
                    {files.length > 1 ? 's' : ''}
                  </strong>

                  {files.map((file) => (
                    <span
                      key={`${file.name}-${file.size}`}
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

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

          <div className="reclamation-form-footer">
            <Link
              to="/dashboard"
              className="btn btn-outline btn-large"
            >
              Annuler
            </Link>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading
                ? 'Envoi en cours...'
                : 'Déposer la réclamation'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default NouvelleReclamation