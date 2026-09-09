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
  actionTypee: string | null
  detail: string | null
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

  categorieIA: string | null
  departementIA: string | null
  serviceIA: string | null
  prioriteIA: string | null
  confianceIA: number | null
  reponseIA: string | null
  reponseFinale: string | null
  analyseIAAt: string | null
  iaValidee: boolean

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

function AIIcon() {
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
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
      />
      <path d="M8 9h8M8 13h5M8 17h3" />
      <circle
        cx="17"
        cy="16"
        r="2"
      />
    </svg>
  )
}

function DetailReclamation() {
  const { id } = useParams<{
    id: string
  }>()

  const navigate = useNavigate()

  const [reclamation, setReclamation] =
    useState<Reclamation | null>(null)

  const [role, setRole] =
    useState('')

  const [selectedStatus, setSelectedStatus] =
    useState('')

  const [selectedDepartement, setSelectedDepartement] =
    useState('')

  const [selectedService, setSelectedService] =
    useState('')

  const [selectedPriorite, setSelectedPriorite] =
    useState('')

  const [responseDraft, setResponseDraft] =
    useState('')

  const [sendingResponse, setSendingResponse] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [updating, setUpdating] =
    useState(false)

  const [updatingAI, setUpdatingAI] =
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

  function applyReclamationData(
    data: Reclamation,
  ) {
    const normalizedData: Reclamation = {
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

      iaValidee:
        data.iaValidee === true,

      categorieIA:
        data.categorieIA ??
        null,

      departementIA:
        data.departementIA ??
        null,

      serviceIA:
        data.serviceIA ??
        null,

      prioriteIA:
        data.prioriteIA ??
        null,

      confianceIA:
        typeof data.confianceIA ===
          'number'
          ? data.confianceIA
          : null,

      reponseIA:
        typeof data.reponseIA ===
          'string'
          ? data.reponseIA.trim() ||
            null
          : null,

      reponseFinale:
        typeof data.reponseFinale ===
          'string'
          ? data.reponseFinale.trim() ||
            null
          : null,

      analyseIAAt:
        data.analyseIAAt ??
        null,
    }

    setReclamation(
      normalizedData,
    )

    setSelectedStatus(
      normalizedData.statut,
    )

    setSelectedDepartement(
      normalizedData.departement ||
        normalizedData.departementIA ||
        '',
    )

    setSelectedService(
      normalizedData.service ||
        normalizedData.serviceIA ||
        '',
    )

    setSelectedPriorite(
      normalizedData.priorite ||
        normalizedData.prioriteIA ||
        'NORMALE',
    )

    setResponseDraft(
      normalizedData.reponseFinale ||
        normalizedData.reponseIA ||
        '',
    )
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

        setRole(
          user.role
            .trim()
            .toUpperCase(),
        )
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
                Authorization:
                  `Bearer ${token}`,
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

        applyReclamationData(
          data as Reclamation,
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

  function getHistoryActionLabel(
    actionTypee: string | null,
  ) {
    switch (actionTypee) {
      case 'CREATION':
        return 'Création'

      case 'VALIDATION_IA':
        return 'Validation de la classification IA'

      case 'STATUT':
        return 'Changement de statut'

      case 'REPONSE_CITOYEN':
        return 'Réponse au citoyen'

      default:
        return 'Action'
    }
  }

  function getHistoryActionClass(
    actionTypee: string | null,
  ) {
    switch (actionTypee) {
      case 'CREATION':
        return 'history-action history-action-create'

      case 'VALIDATION_IA':
        return 'history-action history-action-ai'

      case 'STATUT':
        return 'history-action history-action-status'

      case 'REPONSE_CITOYEN':
        return 'history-action history-action-response'

      default:
        return 'history-action'
    }
  }

  function getHistoryTitle(
    historique: HistoriqueReclamation,
  ) {
    if (
      historique.actionTypee ===
      'VALIDATION_IA'
    ) {
      return 'Classification IA validée'
    }

    if (
      historique.actionTypee ===
      'REPONSE_CITOYEN'
    ) {
      return 'Réponse envoyée au citoyen'
    }

    if (
      historique.actionTypee ===
      'STATUT'
    ) {
      if (
        historique.ancienStatut
      ) {
        return `${getStatusLabel(
          historique.ancienStatut,
        )} → ${getStatusLabel(
          historique.nouveauStatut,
        )}`
      }

      return `Statut : ${getStatusLabel(
        historique.nouveauStatut,
      )}`
    }

    if (
      historique.actionTypee ===
      'CREATION'
    ) {
      return 'Réclamation créée'
    }

    if (
      historique.ancienStatut
    ) {
      return `${getStatusLabel(
        historique.ancienStatut,
      )} → ${getStatusLabel(
        historique.nouveauStatut,
      )}`
    }

    return `Réclamation créée — ${getStatusLabel(
      historique.nouveauStatut,
    )}`
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

  function formatConfidence(
    confidence: number | null,
  ) {
    if (
      confidence === null ||
      !Number.isFinite(
        confidence,
      )
    ) {
      return 'Non disponible'
    }

    return `${Math.round(
      confidence * 100,
    )} %`
  }

  function getConfidenceClass(
    confidence: number | null,
  ) {
    if (
      confidence === null ||
      !Number.isFinite(
        confidence,
      )
    ) {
      return ''
    }

    if (confidence >= 0.85) {
      return 'priority-low'
    }

    if (confidence >= 0.65) {
      return 'priority-normal'
    }

    if (confidence >= 0.4) {
      return 'priority-high'
    }

    return 'priority-urgent'
  }

  function formatCategory(
    categorie: string | null,
  ) {
    if (!categorie) {
      return 'Non disponible'
    }

    return categorie
      .replace(
        /_/g,
        ' ',
      )
      .toLowerCase()
      .replace(
        /(^\w|\s\w)/g,
        (letter) =>
          letter.toUpperCase(),
      )
  }

  function formatAiValue(
    value: string | null,
  ) {
    if (!value) {
      return 'Non disponible'
    }

    return value
      .replace(
        /_/g,
        ' ',
      )
      .toLowerCase()
      .replace(
        /(^\w|\s\w)/g,
        (letter) =>
          letter.toUpperCase(),
      )
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
              Authorization:
                `Bearer ${token}`,
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
              Authorization:
                `Bearer ${token}`,
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

      const refreshResponse =
        await fetch(
          `http://localhost:3000/reclamations/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization:
                `Bearer ${token}`,
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

        applyReclamationData(
          refreshData as Reclamation,
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

  async function handleValidateAI() {
    const token =
      localStorage.getItem(
        'access_token',
      )

    if (
      !token ||
      !id ||
      !reclamation ||
      reclamation.iaValidee
    ) {
      return
    }

    const departement =
      selectedDepartement.trim()

    const service =
      selectedService.trim()

    const priorite =
      selectedPriorite
        .trim()
        .toUpperCase()

    if (!departement) {
      setError(
        'Le département final est obligatoire.',
      )
      return
    }

    if (!service) {
      setError(
        'Le service final est obligatoire.',
      )
      return
    }

    const prioritesAutorisees = [
      'BASSE',
      'NORMALE',
      'HAUTE',
      'URGENTE',
    ]

    if (
      !prioritesAutorisees.includes(
        priorite,
      )
    ) {
      setError(
        'La priorité sélectionnée est invalide.',
      )
      return
    }

    setError('')
    setSuccess('')
    setUpdatingAI(true)

    try {
      const response =
        await fetch(
          `http://localhost:3000/reclamations/${id}/analyse-ia`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              departement,
              service,
              priorite,
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
                'Impossible de valider l’analyse IA.',
        )
      }

      applyReclamationData(
        data as Reclamation,
      )

      setSuccess(
        'La classification IA a été validée et les valeurs finales ont été enregistrées.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setUpdatingAI(false)
    }
  }

  async function handleSendResponse() {
    const token =
      localStorage.getItem(
        'access_token',
      )

    if (
      !token ||
      !id ||
      !reclamation
    ) {
      return
    }

    const responseText =
      responseDraft.trim()

    if (!responseText) {
      setError(
        'La réponse au citoyen ne peut pas être vide.',
      )
      return
    }

    if (reclamation.reponseFinale) {
      setError(
        'Une réponse finale a déjà été envoyée pour cette réclamation.',
      )
      return
    }

    setError('')
    setSuccess('')
    setSendingResponse(true)

    try {
      const response =
        await fetch(
          `http://localhost:3000/reclamations/${id}/reponse`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              reponse:
                responseText,
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
                'Impossible d’envoyer la réponse au citoyen.',
        )
      }

      const refreshResponse =
        await fetch(
          `http://localhost:3000/reclamations/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        )

      if (
        refreshResponse.status === 401
      ) {
        clearSessionAndRedirect()
        return
      }

      if (refreshResponse.ok) {
        const refreshData =
          await refreshResponse.json()

        applyReclamationData(
          refreshData as Reclamation,
        )
      } else if (
        data.reclamation
      ) {
        applyReclamationData(
          data.reclamation as Reclamation,
        )
      } else {
        setResponseDraft(
          responseText,
        )
      }

      setSuccess(
        'La réponse finale a été envoyée au citoyen avec succès.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setSendingResponse(false)
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

  const hasAiAnalysis =
    Boolean(
      reclamation.categorieIA ||
      reclamation.departementIA ||
      reclamation.serviceIA ||
      reclamation.prioriteIA ||
      reclamation.confianceIA !== null ||
      reclamation.reponseIA ||
      reclamation.analyseIAAt,
    )

  const needsAiValidation =
    canChangeStatus &&
    hasAiAnalysis &&
    !reclamation.iaValidee

  const aiMatchesFinalValues =
    Boolean(
      reclamation.departementIA &&
      reclamation.serviceIA &&
      reclamation.prioriteIA &&
      reclamation.departement ===
        reclamation.departementIA &&
      reclamation.service ===
        reclamation.serviceIA &&
      reclamation.priorite ===
        reclamation.prioriteIA,
    )

  const canSendResponse =
    canChangeStatus &&
    !reclamation.reponseFinale &&
    Boolean(
      reclamation.reponseIA,
    )

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
              Consultez les informations, les
              fichiers et l'historique du traitement.
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

              {hasAiAnalysis && (
                <span
                  className={
                    reclamation.iaValidee
                      ? 'agent-ai-badge agent-ai-badge-valid'
                      : 'agent-ai-badge agent-ai-badge-pending'
                  }
                >
                  {reclamation.iaValidee
                    ? 'Classification validée'
                    : 'IA à valider'}
                </span>
              )}
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
                  Le nouveau statut sera enregistré
                  dans l'historique.
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
                    updating ||
                    updatingAI ||
                    sendingResponse
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
                    updatingAI ||
                    sendingResponse ||
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

          {hasAiAnalysis && (
            <div className="detail-section">
              <h3>
                <span className="detail-heading-icon">
                  <AIIcon />
                </span>

                Analyse IA
              </h3>

              <div className="detail-grid">
                <div>
                  <span>
                    Catégorie détectée
                  </span>

                  <strong>
                    {formatCategory(
                      reclamation.categorieIA,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Département proposé
                  </span>

                  <strong>
                    {formatAiValue(
                      reclamation.departementIA,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Service proposé
                  </span>

                  <strong>
                    {formatAiValue(
                      reclamation.serviceIA,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Priorité proposée
                  </span>

                  <strong>
                    {reclamation.prioriteIA ? (
                      <span
                        className={`priority-badge ${getPriorityClass(
                          reclamation.prioriteIA,
                        )}`}
                      >
                        {getPriorityLabel(
                          reclamation.prioriteIA,
                        )}
                      </span>
                    ) : (
                      'Non disponible'
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Niveau de confiance
                  </span>

                  <strong>
                    {reclamation.confianceIA !==
                    null ? (
                      <span
                        className={`priority-badge ${getConfidenceClass(
                          reclamation.confianceIA,
                        )}`}
                      >
                        {formatConfidence(
                          reclamation.confianceIA,
                        )}
                      </span>
                    ) : (
                      'Non disponible'
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    État de validation
                  </span>

                  <strong>
                    <span
                      className={
                        reclamation.iaValidee
                          ? 'agent-ai-badge agent-ai-badge-valid'
                          : 'agent-ai-badge agent-ai-badge-pending'
                      }
                    >
                      {reclamation.iaValidee
                        ? 'Classification validée'
                        : 'IA à valider'}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>
                    Date de l'analyse
                  </span>

                  <strong>
                    {reclamation.analyseIAAt
                      ? formatDateTime(
                          reclamation.analyseIAAt,
                        )
                      : 'Non renseignée'}
                  </strong>
                </div>
              </div>

              {reclamation.reponseIA && (
                <div className="ai-response-panel">
                  <div className="ai-response-header">
                    <div>
                      <span className="ai-response-label">
                        Réponse proposée par l'IA
                      </span>

                      <h4>
                        Proposition de réponse au citoyen
                      </h4>
                    </div>

                    <span className="ai-response-badge">
                      Brouillon IA
                    </span>
                  </div>

                  <div className="ai-response-content">
                    {reclamation.reponseIA}
                  </div>

                  <p className="ai-response-note">
                    Cette réponse est une proposition générée
                    automatiquement. Elle doit être vérifiée,
                    puis modifiée si nécessaire, par un agent
                    avant tout envoi au citoyen.
                  </p>
                </div>
              )}

              {canSendResponse && (
                <div className="final-response-panel">
                  <div className="final-response-header">
                    <div>
                      <span className="final-response-label">
                        Réponse finale
                      </span>

                      <h4>
                        Vérifier et envoyer au citoyen
                      </h4>
                    </div>

                    <span className="final-response-badge">
                      Action agent
                    </span>
                  </div>

                  <p className="final-response-description">
                    Vous pouvez modifier la proposition de
                    l’IA avant de l’envoyer. Le texte ci-dessous
                    sera enregistré comme réponse finale et
                    transmis au citoyen par notification.
                  </p>

                  <div className="final-response-field">
                    <label htmlFor="reponse-finale">
                      Message envoyé au citoyen
                    </label>

                    <textarea
                      id="reponse-finale"
                      value={
                        responseDraft
                      }
                      onChange={(
                        event,
                      ) =>
                        setResponseDraft(
                          event.target.value,
                        )
                      }
                      rows={7}
                      placeholder="Rédigez la réponse finale au citoyen..."
                      disabled={
                        sendingResponse
                      }
                    />
                  </div>

                  <div className="final-response-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        handleSendResponse
                      }
                      disabled={
                        sendingResponse ||
                        !responseDraft.trim()
                      }
                    >
                      {sendingResponse
                        ? 'Envoi en cours...'
                        : 'Envoyer au citoyen'}
                    </button>
                  </div>
                </div>
              )}

              {reclamation.reponseFinale && (
                <div className="final-response-sent-panel">
                  <div className="final-response-header">
                    <div>
                      <span className="final-response-label">
                        Réponse finale envoyée
                      </span>

                      <h4>
                        Réponse transmise au citoyen
                      </h4>
                    </div>

                    <span className="final-response-sent-badge">
                      Envoyée
                    </span>
                  </div>

                  <div className="final-response-content">
                    {reclamation.reponseFinale}
                  </div>

                  <p className="final-response-note">
                    Cette réponse est la version finale enregistrée
                    et transmise au citoyen. Elle ne peut plus être
                    renvoyée depuis cette réclamation.
                  </p>
                </div>
              )}

              {needsAiValidation && (
                <div className="ai-validation-panel">
                  <div className="ai-validation-header">
                    <div>
                      <span className="ai-validation-label">
                        Validation humaine
                      </span>

                      <h4>
                        Valider ou corriger la classification
                      </h4>
                    </div>

                    <span
                      className={
                        aiMatchesFinalValues
                          ? 'ai-validation-state ai-validation-confirmed'
                          : 'ai-validation-state ai-validation-to-review'
                      }
                    >
                      {aiMatchesFinalValues
                        ? 'Classification concordante'
                        : 'Vérification recommandée'}
                    </span>
                  </div>

                  <p className="ai-validation-description">
                    Vérifiez la proposition de
                    l’intelligence artificielle puis
                    confirmez les valeurs finales de la
                    réclamation.
                  </p>

                  <div className="ai-validation-grid">
                    <div className="ai-validation-field">
                      <label htmlFor="ai-departement">
                        Département final
                      </label>

                      <input
                        id="ai-departement"
                        type="text"
                        value={
                          selectedDepartement
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedDepartement(
                            event.target.value,
                          )
                        }
                        placeholder="Département"
                        disabled={
                          updatingAI
                        }
                      />
                    </div>

                    <div className="ai-validation-field">
                      <label htmlFor="ai-service">
                        Service final
                      </label>

                      <input
                        id="ai-service"
                        type="text"
                        value={
                          selectedService
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedService(
                            event.target.value,
                          )
                        }
                        placeholder="Service"
                        disabled={
                          updatingAI
                        }
                      />
                    </div>

                    <div className="ai-validation-field">
                      <label htmlFor="ai-priorite">
                        Priorité finale
                      </label>

                      <select
                        id="ai-priorite"
                        value={
                          selectedPriorite
                        }
                        onChange={(
                          event,
                        ) =>
                          setSelectedPriorite(
                            event.target.value,
                          )
                        }
                        disabled={
                          updatingAI
                        }
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
                  </div>

                  <div className="ai-validation-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        handleValidateAI
                      }
                      disabled={
                        updatingAI ||
                        updating ||
                        sendingResponse
                      }
                    >
                      {updatingAI
                        ? 'Enregistrement...'
                        : 'Valider la classification IA'}
                    </button>
                  </div>
                </div>
              )}

              {canChangeStatus &&
                hasAiAnalysis &&
                reclamation.iaValidee && (
                <div className="ai-validation-readonly">
                  <strong>
                    Classification IA validée
                  </strong>

                  <p>
                    Cette classification a déjà été
                    vérifiée et enregistrée par un agent
                    ou un administrateur.
                  </p>
                </div>
              )}

              {!canChangeStatus && (
                <div className="ai-validation-readonly">
                  <strong>
                    Classification assistée par IA
                  </strong>

                  <p>
                    Cette analyse est présentée à
                    titre informatif. La validation et
                    la correction sont réservées aux
                    agents et administrateurs de la
                    commune.
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasAiAnalysis && (
            <div className="detail-section">
              <h3>
                <span className="detail-heading-icon">
                  <AIIcon />
                </span>

                Analyse IA
              </h3>

              <div className="detail-empty">
                Aucune analyse IA enregistrée pour
                cette réclamation.
              </div>
            </div>
          )}

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
                          <div className="history-title-group">
                            <strong>
                              {getHistoryTitle(
                                historique,
                              )}
                            </strong>

                            {historique.actionTypee && (
                              <span
                                className={getHistoryActionClass(
                                  historique.actionTypee,
                                )}
                              >
                                {getHistoryActionLabel(
                                  historique.actionTypee,
                                )}
                              </span>
                            )}
                          </div>

                          <time>
                            {formatDateTime(
                              historique.createdAt,
                            )}
                          </time>
                        </div>

                        <p>
                          Par :{' '}
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

                        {historique.detail && (
                          <div className="history-detail">
                            {historique.detail}
                          </div>
                        )}
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