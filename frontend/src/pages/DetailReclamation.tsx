import {
  useEffect,
  useState,
} from 'react'

import type {
  MouseEvent,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import '../App.css'

type FichierJoint = {
  id: number
  nomFichier: string
  chemin: string
  typeMime: string | null
  taille: number | null
  createdAt: string
}

type HistoriqueReclamation = {
  id: number
  ancienStatut: string | null
  nouveauStatut: string
  createdAt: string
  user?: {
    id: number
    nom: string
    email: string
    role: string
  } | null
}

type Reclamation = {
  id: number
  numeroClassement: number
  numeroBureauOrdre: string | null
  dateBureauOrdre: string | null
  dateReception: string | null
  departement: string | null
  service: string | null
  misEnCause: string | null
  statut: string
  priorite: string
  titre: string
  description: string
  createdAt: string
  updatedAt: string
  fichiers?: FichierJoint[]
  historiques?: HistoriqueReclamation[]
}

type User = {
  id: number
  nom: string
  email: string
  role: string
}

function DocumentIcon() {
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
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

function HistoryIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v5l3 2" />
      <path d="M4 5l2 2" />
    </svg>
  )
}

function DetailReclamation() {
  const { id } =
    useParams<{
      id: string
    }>()

  const navigate =
    useNavigate()

  const [reclamation, setReclamation] =
    useState<Reclamation | null>(
      null,
    )

  const [role, setRole] =
    useState('')

  const [selectedStatus, setSelectedStatus] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [updating, setUpdating] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  function clearSessionAndRedirect() {
    localStorage.removeItem(
      'access_token',
    )

    localStorage.removeItem(
      'user',
    )

    navigate('/connexion', {
      replace: true,
    })
  }

  useEffect(() => {
    const token =
      localStorage.getItem(
        'access_token',
      )

    const savedUser =
      localStorage.getItem(
        'user',
      )

    if (!token) {
      navigate('/connexion')
      return
    }

    if (savedUser) {
      try {
        const user: User =
          JSON.parse(savedUser)

        setRole(user.role)
      } catch {
        clearSessionAndRedirect()
        return
      }
    }

    if (!id) {
      setError(
        'Identifiant de réclamation invalide.',
      )

      setLoading(false)
      return
    }

    async function loadReclamation() {
      try {
        const response =
          await fetch(
            `http://localhost:3000/reclamations/${id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

        const data =
          await response.json()

        if (
          response.status === 401
        ) {
          clearSessionAndRedirect()
          return
        }

        if (!response.ok) {
          throw new Error(
            Array.isArray(
              data.message,
            )
              ? data.message.join(', ')
              : data.message ||
                  'Impossible de récupérer la réclamation.',
          )
        }

        setReclamation({
          ...data,

          fichiers:
            Array.isArray(
              data.fichiers,
            )
              ? data.fichiers
              : [],

          historiques:
            Array.isArray(
              data.historiques,
            )
              ? data.historiques
              : [],

          priorite:
            data.priorite ||
            'NORMALE',
        })

        setSelectedStatus(
          data.statut,
        )
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

    loadReclamation()
  }, [id, navigate])

  function getStatusLabel(
    statut: string,
  ) {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'En attente'

      case 'EN_COURS':
        return 'En cours'

      case 'TRAITEE':
        return 'Traitée'

      case 'REJETEE':
        return 'Rejetée'

      default:
        return statut
    }
  }

  function getStatusClass(
    statut: string,
  ) {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'status-pending'

      case 'EN_COURS':
        return 'status-progress'

      case 'TRAITEE':
        return 'status-done'

      case 'REJETEE':
        return 'status-rejected'

      default:
        return 'status-default'
    }
  }

  function getPriorityLabel(
    priorite: string,
  ) {
    switch (priorite) {
      case 'BASSE':
        return 'Basse'

      case 'NORMALE':
        return 'Normale'

      case 'HAUTE':
        return 'Haute'

      case 'URGENTE':
        return 'Urgente'

      default:
        return priorite || 'Normale'
    }
  }

  function getPriorityClass(
    priorite: string,
  ) {
    switch (priorite) {
      case 'BASSE':
        return 'priority-low'

      case 'NORMALE':
        return 'priority-normal'

      case 'HAUTE':
        return 'priority-high'

      case 'URGENTE':
        return 'priority-urgent'

      default:
        return 'priority-normal'
    }
  }

  function formatDate(
    date: string | null,
  ) {
    if (!date) {
      return 'Non renseignée'
    }

    return new Date(
      date,
    ).toLocaleDateString(
      'fr-FR',
    )
  }

  function formatDateTime(
    date: string,
  ) {
    return new Date(
      date,
    ).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  function formatFileSize(
    size: number | null,
  ) {
    if (
      size === null ||
      size === undefined
    ) {
      return ''
    }

    if (size < 1024) {
      return `${size} octets`
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} Ko`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} Mo`
  }

  function getFileUrl(
    reclamationId: number,
    fichierId: number,
  ) {
    return `http://localhost:3000/reclamations/${reclamationId}/fichiers/${fichierId}/telecharger`
  }

  async function handleDownloadFile(
    reclamationId: number,
    fichier: FichierJoint,
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    const token =
      localStorage.getItem(
        'access_token',
      )

    if (!token) {
      clearSessionAndRedirect()
      return
    }

    setError('')

    const newWindow =
      window.open(
        'about:blank',
        '_blank',
      )

    try {
      const response =
        await fetch(
          getFileUrl(
            reclamationId,
            fichier.id,
          ),
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

      if (
        response.status === 401
      ) {
        if (newWindow) {
          newWindow.close()
        }

        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => null,
            )

        if (newWindow) {
          newWindow.close()
        }

        throw new Error(
          Array.isArray(
            data?.message,
          )
            ? data.message.join(', ')
            : data?.message ||
                'Impossible d’ouvrir le fichier.',
        )
      }

      const arrayBuffer =
        await response.arrayBuffer()

      const blob =
        new Blob(
          [arrayBuffer],
          {
            type:
              fichier.typeMime ||
              'application/pdf',
          },
        )

      const objectUrl =
        URL.createObjectURL(
          blob,
        )

      if (newWindow) {
        newWindow.location.href =
          objectUrl
      } else {
        const link =
          document.createElement(
            'a',
          )

        link.href =
          objectUrl

        link.download =
          fichier.nomFichier

        document.body.appendChild(
          link,
        )

        link.click()

        link.remove()
      }

      setTimeout(() => {
        URL.revokeObjectURL(
          objectUrl,
        )
      }, 60000)
    } catch (err) {
      if (newWindow) {
        newWindow.close()
      }

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible d’ouvrir le fichier.',
      )
    }
  }

  async function handleUpdateStatus() {
    const token =
      localStorage.getItem(
        'access_token',
      )

    if (
      !token ||
      !id ||
      !selectedStatus
    ) {
      return
    }

    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      const response =
        await fetch(
          `http://localhost:3000/reclamations/${id}/statut`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              statut:
                selectedStatus,
            }),
          },
        )

      const data =
        await response.json()

      if (
        response.status === 401
      ) {
        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        throw new Error(
          Array.isArray(
            data.message,
          )
            ? data.message.join(', ')
            : data.message ||
                'Impossible de modifier le statut.',
        )
      }

      setReclamation(
        (current) =>
          current
            ? {
                ...current,

                statut:
                  data.statut ??
                  selectedStatus,

                updatedAt:
                  data.updatedAt ??
                  current.updatedAt,
              }
            : current,
      )

      setSelectedStatus(
        data.statut ??
          selectedStatus,
      )

      const refreshResponse =
        await fetch(
          `http://localhost:3000/reclamations/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

      if (
        refreshResponse.status ===
        401
      ) {
        clearSessionAndRedirect()
        return
      }

      if (refreshResponse.ok) {
        const refreshData =
          await refreshResponse.json()

        setReclamation({
          ...refreshData,

          fichiers:
            Array.isArray(
              refreshData.fichiers,
            )
              ? refreshData.fichiers
              : [],

          historiques:
            Array.isArray(
              refreshData.historiques,
            )
              ? refreshData.historiques
              : [],

          priorite:
            refreshData.priorite ||
            'NORMALE',
        })

        setSelectedStatus(
          refreshData.statut ??
            selectedStatus,
        )
      }

      setSuccess(
        'Le statut de la réclamation a été mis à jour.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <main className="detail-page">
        <div className="detail-container">
          <div className="detail-message">
            Chargement de la réclamation...
          </div>
        </div>
      </main>
    )
  }

  if (
    error &&
    !reclamation
  ) {
    return (
      <main className="detail-page">
        <div className="detail-container">
          <div
            className="detail-message detail-error"
            role="alert"
          >
            {error}
          </div>

          <Link
            to={
              role === 'AGENT'
                ? '/agent/dashboard'
                : role === 'ADMIN'
                  ? '/admin/dashboard'
                  : '/dashboard'
            }
            className="btn btn-outline"
          >
            Retour au dashboard
          </Link>
        </div>
      </main>
    )
  }

  if (!reclamation) {
    return (
      <main className="detail-page">
        <div className="detail-container">
          <div className="detail-message detail-error">
            Réclamation introuvable.
          </div>
        </div>
      </main>
    )
  }

  const canChangeStatus =
    role === 'AGENT' ||
    role === 'ADMIN'

  const historiques =
    reclamation.historiques ?? []

  const fichiers =
    reclamation.fichiers ?? []

  return (
    <main className="detail-page">
      <div className="detail-container">
        <header className="detail-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — DÉTAIL DE LA RÉCLAMATION
            </span>

            <h1>
              Réclamation #
              {reclamation.numeroClassement}
            </h1>

            <p>
              Consultez les informations, les fichiers et l'historique du traitement.
            </p>
          </div>

          <Link
            to={
              role === 'AGENT'
                ? '/agent/dashboard'
                : role === 'ADMIN'
                  ? '/admin/dashboard'
                  : '/dashboard'
            }
            className="btn btn-outline"
          >
            Retour au dashboard
          </Link>
        </header>

        <section className="detail-card">
          <div className="detail-title-row">
            <div>
              <span className="detail-reference">
                Référence #
                {reclamation.numeroClassement}
              </span>

              <h2>
                {reclamation.titre ||
                  `Réclamation #${reclamation.numeroClassement}`}
              </h2>
            </div>

            <div className="detail-title-statuses">
              <span
                className={`status-badge ${getStatusClass(
                  reclamation.statut,
                )}`}
              >
                {getStatusLabel(
                  reclamation.statut,
                )}
              </span>

              <span
                className={`priority-badge ${getPriorityClass(
                  reclamation.priorite,
                )}`}
              >
                Priorité :{' '}
                {getPriorityLabel(
                  reclamation.priorite,
                )}
              </span>
            </div>
          </div>

          {canChangeStatus && (
            <div className="status-management">
              <div>
                <span className="status-management-label">
                  Traitement de la réclamation
                </span>

                <h3>
                  Modifier le statut
                </h3>

                <p>
                  Le nouveau statut sera enregistré dans l'historique.
                </p>
              </div>

              <div className="status-management-controls">
                <select
                  value={
                    selectedStatus
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedStatus(
                      event.target.value,
                    )
                  }
                  disabled={
                    updating
                  }
                >
                  <option value="EN_ATTENTE">
                    En attente
                  </option>

                  <option value="EN_COURS">
                    En cours
                  </option>

                  <option value="TRAITEE">
                    Traitée
                  </option>

                  <option value="REJETEE">
                    Rejetée
                  </option>
                </select>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    handleUpdateStatus
                  }
                  disabled={
                    updating ||
                    selectedStatus ===
                      reclamation.statut
                  }
                >
                  {updating
                    ? 'Mise à jour...'
                    : 'Mettre à jour'}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div
              className="detail-success"
              role="status"
            >
              {success}
            </div>
          )}

          {error && reclamation && (
            <div
              className="detail-inline-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="detail-section">
            <h3>
              Informations administratives
            </h3>

            <div className="detail-grid">
              <div>
                <span>
                  Numéro du bureau d'ordre
                </span>

                <strong>
                  {reclamation.numeroBureauOrdre ||
                    'Non renseigné'}
                </strong>
              </div>

              <div>
                <span>
                  Date du bureau d'ordre
                </span>

                <strong>
                  {formatDate(
                    reclamation.dateBureauOrdre,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Date de réception
                </span>

                <strong>
                  {formatDate(
                    reclamation.dateReception,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Date de dépôt
                </span>

                <strong>
                  {formatDate(
                    reclamation.createdAt,
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              Service concerné
            </h3>

            <div className="detail-grid">
              <div>
                <span>
                  Département
                </span>

                <strong>
                  {reclamation.departement ||
                    'Non renseigné'}
                </strong>
              </div>

              <div>
                <span>
                  Service
                </span>

                <strong>
                  {reclamation.service ||
                    'Non renseigné'}
                </strong>
              </div>

              <div>
                <span>
                  Mis en cause
                </span>

                <strong>
                  {reclamation.misEnCause ||
                    'Non renseigné'}
                </strong>
              </div>

              <div>
                <span>
                  Priorité
                </span>

                <strong>
                  <span
                    className={`priority-badge ${getPriorityClass(
                      reclamation.priorite,
                    )}`}
                  >
                    {getPriorityLabel(
                      reclamation.priorite,
                    )}
                  </span>
                </strong>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              Description
            </h3>

            <div className="detail-description">
              {reclamation.description ||
                'Aucune description disponible.'}
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <span className="detail-heading-icon">
                <DocumentIcon />
              </span>

              Fichiers joints
            </h3>

            {fichiers.length > 0 ? (
              <div className="file-list">
                {fichiers.map(
                  (fichier) => (
                    <a
                      key={fichier.id}
                      href={getFileUrl(
                        reclamation.id,
                        fichier.id,
                      )}
                      onClick={(
                        event,
                      ) =>
                        handleDownloadFile(
                          reclamation.id,
                          fichier,
                          event,
                        )
                      }
                      className="file-item"
                    >
                      <span className="file-icon">
                        <DocumentIcon />
                      </span>

                      <span className="file-info">
                        <strong>
                          {
                            fichier.nomFichier
                          }
                        </strong>

                        {fichier.taille !==
                          null && (
                          <small>
                            {formatFileSize(
                              fichier.taille,
                            )}
                          </small>
                        )}
                      </span>

                      <span className="file-action">
                        Voir
                      </span>
                    </a>
                  ),
                )}
              </div>
            ) : (
              <div className="detail-empty">
                Aucun fichier joint à cette réclamation.
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>
              <span className="detail-heading-icon">
                <HistoryIcon />
              </span>

              Historique du traitement
            </h3>

            {historiques.length >
            0 ? (
              <div className="history-list">
                {historiques.map(
                  (
                    historique,
                    index,
                  ) => (
                    <div
                      key={
                        historique.id
                      }
                      className="history-item"
                    >
                      <div className="history-marker">
                        <span />

                        {index <
                          historiques.length -
                            1 && (
                          <i />
                        )}
                      </div>

                      <div className="history-content">
                        <div className="history-top">
                          <strong>
                            {historique.ancienStatut
                              ? `${getStatusLabel(
                                  historique.ancienStatut,
                                )} → ${getStatusLabel(
                                  historique.nouveauStatut,
                                )}`
                              : `Réclamation créée — ${getStatusLabel(
                                  historique.nouveauStatut,
                                )}`}
                          </strong>

                          <time>
                            {formatDateTime(
                              historique.createdAt,
                            )}
                          </time>
                        </div>

                        <p>
                          Par:{' '}
                          <strong>
                            {historique.user?.nom ||
                              'Utilisateur'}
                          </strong>

                          {historique.user?.role && (
                            <span>
                              {' '}
                              —{' '}
                              {
                                historique.user.role
                              }
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="detail-empty">
                Aucun historique disponible.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default DetailReclamation