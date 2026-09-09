import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import {
  exportReclamationsCsv,
  exportReclamationsPdf,
} from '../utils/exportReclamations'

type User = {
  id: number
  nom: string
  email: string
  role: string
}

type Reclamation = {
  id: number
  numeroClassement: number
  titre: string
  statut: string
  priorite: string
  departement: string | null
  service: string | null
  createdAt: string
  updatedAt: string
  iaValidee: boolean
  categorieIA: string | null
  departementIA: string | null
  serviceIA: string | null
  prioriteIA: string | null
  confianceIA: number | null
  analyseIAAt: string | null
  user?: User
}

type Statistiques = {
  total: number
  enAttente: number
  enCours: number
  traitees: number
  rejetees: number
  parService: {
    service: string
    total: number
  }[]
  parDepartement: {
    departement: string
    total: number
  }[]
  parPriorite: {
    priorite: string
    total: number
  }[]
}

function DashboardAdmin() {
  const navigate = useNavigate()
  const reclamationsSectionRef = useRef<HTMLElement | null>(null)

  const [user, setUser] = useState<User | null>(null)

  const [reclamations, setReclamations] = useState<
    Reclamation[]
  >([])

  const [statistiques, setStatistiques] =
    useState<Statistiques | null>(null)

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [prioriteFilter, setPrioriteFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [departementFilter, setDepartementFilter] =
    useState('')
  const [iaValidationFilter, setIaValidationFilter] =
    useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')

    if (!token || !savedUser) {
      navigate('/connexion')
      return
    }

    let currentUser: User

    try {
      currentUser = JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      navigate('/connexion')
      return
    }

    setUser(currentUser)

    if (currentUser.role !== 'ADMIN') {
      navigate('/dashboard')
      return
    }

    async function loadDashboard() {
      try {
        const [
          reclamationsResponse,
          statistiquesResponse,
        ] = await Promise.all([
          fetch(
            'http://localhost:3000/reclamations',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch(
            'http://localhost:3000/reclamations/statistiques',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ])

        if (
          reclamationsResponse.status === 401 ||
          statistiquesResponse.status === 401
        ) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')

          navigate('/connexion', {
            replace: true,
          })

          return
        }

        const reclamationsData =
          await reclamationsResponse.json()

        const statistiquesData =
          await statistiquesResponse.json()

        if (!reclamationsResponse.ok) {
          throw new Error(
            Array.isArray(reclamationsData.message)
              ? reclamationsData.message.join(', ')
              : reclamationsData.message ||
                  'Impossible de récupérer les réclamations.',
          )
        }

        if (!statistiquesResponse.ok) {
          throw new Error(
            Array.isArray(statistiquesData.message)
              ? statistiquesData.message.join(', ')
              : statistiquesData.message ||
                  'Impossible de récupérer les statistiques.',
          )
        }

        const listData: Reclamation[] =
          Array.isArray(reclamationsData)
            ? reclamationsData
            : reclamationsData.data ?? []

        const list: Reclamation[] =
          listData.map((reclamation) => ({
            ...reclamation,

            priorite:
              reclamation.priorite ||
              'NORMALE',

            iaValidee:
              reclamation.iaValidee === true,

            categorieIA:
              reclamation.categorieIA ??
              null,

            departementIA:
              reclamation.departementIA ??
              null,

            serviceIA:
              reclamation.serviceIA ??
              null,

            prioriteIA:
              reclamation.prioriteIA ??
              null,

            confianceIA:
              reclamation.confianceIA ??
              null,

            analyseIAAt:
              reclamation.analyseIAAt ??
              null,
          }))

        const statsData =
          statistiquesData.data ??
          statistiquesData

        const stats: Statistiques = {
          total: statsData.total ?? 0,

          enAttente:
            statsData.enAttente ?? 0,

          enCours:
            statsData.enCours ?? 0,

          traitees:
            statsData.traitees ?? 0,

          rejetees:
            statsData.rejetees ?? 0,

          parService:
            Array.isArray(
              statsData.parService,
            )
              ? statsData.parService
              : [],

          parDepartement:
            Array.isArray(
              statsData.parDepartement,
            )
              ? statsData.parDepartement
              : [],

          parPriorite:
            Array.isArray(
              statsData.parPriorite,
            )
              ? statsData.parPriorite
              : [],
        }

        setReclamations(list)
        setStatistiques(stats)
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

    loadDashboard()
  }, [navigate])

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/connexion')
  }

  function statusLabel(statut: string) {
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

  function statusClass(statut: string) {
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

  function priorityLabel(priorite: string) {
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
        return 'Normale'
    }
  }

  function priorityClass(priorite: string) {
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

  function iaValidationLabel(
    iaValidee: boolean,
  ) {
    return iaValidee
      ? 'Classification validée'
      : 'IA à valider'
  }

  function iaValidationClass(
    iaValidee: boolean,
  ) {
    return iaValidee
      ? 'agent-ai-badge agent-ai-badge-valid'
      : 'agent-ai-badge agent-ai-badge-pending'
  }

  const tauxTraitement =
    statistiques &&
    statistiques.total > 0
      ? Math.round(
          ((statistiques.traitees +
            statistiques.rejetees) /
            statistiques.total) *
            100,
        )
      : 0

  const services = useMemo(() => {
    return Array.from(
      new Set(
        reclamations
          .map((item) => item.service?.trim())
          .filter(
            (value): value is string =>
              Boolean(value),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, 'fr-FR'),
    )
  }, [reclamations])

  const departements = useMemo(() => {
    return Array.from(
      new Set(
        reclamations
          .map((item) =>
            item.departement?.trim(),
          )
          .filter(
            (value): value is string =>
              Boolean(value),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, 'fr-FR'),
    )
  }, [reclamations])

  const reclamationsIaAValider = useMemo(() => {
    return reclamations.filter(
      (reclamation) =>
        !reclamation.iaValidee,
    )
  }, [reclamations])

  const reclamationsIaValidees = useMemo(() => {
    return reclamations.filter(
      (reclamation) =>
        reclamation.iaValidee,
    )
  }, [reclamations])

  const pourcentageIaValidee =
    reclamations.length > 0
      ? Math.round(
          (reclamationsIaValidees.length /
            reclamations.length) *
            100,
        )
      : 0

  const reclamationsFiltrees = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return reclamations.filter(
      (reclamation) => {
        const normalizedPriority = (
          reclamation.priorite ||
          'NORMALE'
        ).toLowerCase()

        const normalizedPriorityLabel =
          priorityLabel(
            reclamation.priorite ||
              'NORMALE',
          ).toLowerCase()

        const normalizedIaStatus =
          iaValidationLabel(
            reclamation.iaValidee,
          ).toLowerCase()

        const matchesSearch =
          !normalizedSearch ||
          String(
            reclamation.numeroClassement,
          )
            .toLowerCase()
            .includes(normalizedSearch) ||
          (reclamation.titre || '')
            .toLowerCase()
            .includes(normalizedSearch) ||
          (reclamation.user?.nom || '')
            .toLowerCase()
            .includes(normalizedSearch) ||
          (reclamation.user?.email || '')
            .toLowerCase()
            .includes(normalizedSearch) ||
          (reclamation.service || '')
            .toLowerCase()
            .includes(normalizedSearch) ||
          (reclamation.departement || '')
            .toLowerCase()
            .includes(normalizedSearch) ||
          normalizedPriority.includes(
            normalizedSearch,
          ) ||
          normalizedPriorityLabel.includes(
            normalizedSearch,
          ) ||
          normalizedIaStatus.includes(
            normalizedSearch,
          )

        const matchesStatus =
          !statutFilter ||
          reclamation.statut ===
            statutFilter

        const matchesPriority =
          !prioriteFilter ||
          (reclamation.priorite ||
            'NORMALE') ===
            prioriteFilter

        const matchesService =
          !serviceFilter ||
          (
            reclamation.service ||
            ''
          ).trim() === serviceFilter

        const matchesDepartement =
          !departementFilter ||
          (
            reclamation.departement ||
            ''
          ).trim() ===
            departementFilter

        const matchesIaValidation =
          !iaValidationFilter ||
          (
            iaValidationFilter ===
            'A_VALIDER'
              ? !reclamation.iaValidee
              : reclamation.iaValidee
          )

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesService &&
          matchesDepartement &&
          matchesIaValidation
        )
      },
    )
  }, [
    reclamations,
    search,
    statutFilter,
    prioriteFilter,
    serviceFilter,
    departementFilter,
    iaValidationFilter,
  ])

  function resetFilters() {
    setSearch('')
    setStatutFilter('')
    setPrioriteFilter('')
    setServiceFilter('')
    setDepartementFilter('')
    setIaValidationFilter('')
  }

  function handleExportCsv() {
    exportReclamationsCsv(
      reclamationsFiltrees,
    )
  }

  function handleExportPdf() {
    exportReclamationsPdf(
      reclamationsFiltrees,
      'ADMIN',
    )
  }

  function showIaAValider() {
    setIaValidationFilter('A_VALIDER')

    window.setTimeout(() => {
      reclamationsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
  }

  const filtersActive =
    search.trim() !== '' ||
    statutFilter !== '' ||
    prioriteFilter !== '' ||
    serviceFilter !== '' ||
    departementFilter !== '' ||
    iaValidationFilter !== ''

  const prioriteStats = useMemo(() => {
    const defaults = [
      {
        priorite: 'URGENTE',
        total: 0,
      },
      {
        priorite: 'HAUTE',
        total: 0,
      },
      {
        priorite: 'NORMALE',
        total: 0,
      },
      {
        priorite: 'BASSE',
        total: 0,
      },
    ]

    if (!statistiques?.parPriorite?.length) {
      return defaults
    }

    return defaults.map((item) => ({
      priorite: item.priorite,

      total:
        statistiques.parPriorite.find(
          (stat) =>
            stat.priorite ===
            item.priorite,
        )?.total ?? 0,
    }))
  }, [statistiques])

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — ESPACE ADMINISTRATEUR
            </span>

            <h1>
              Bonjour
              {user?.nom
                ? ` ${user.nom}`
                : ''}
            </h1>

            <p>
              Administrez les réclamations
              et la plateforme SAWTI.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link
              to="/admin/utilisateurs"
              className="btn btn-primary"
            >
              Gestion des utilisateurs
            </Link>

            <Link
              to="/"
              className="btn btn-outline"
            >
              Accueil
            </Link>

            <button
              type="button"
              className="btn btn-outline"
              onClick={logout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {!loading &&
          !error &&
          statistiques && (
            <>
              <section className="admin-stats">
                <article className="admin-stat-card">
                  <span>Total</span>

                  <strong>
                    {statistiques.total}
                  </strong>

                  <small>
                    réclamations
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>En attente</span>

                  <strong>
                    {statistiques.enAttente}
                  </strong>

                  <small>
                    à traiter
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>En cours</span>

                  <strong>
                    {statistiques.enCours}
                  </strong>

                  <small>
                    en traitement
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>Traitées</span>

                  <strong>
                    {statistiques.traitees}
                  </strong>

                  <small>
                    terminées
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>Rejetées</span>

                  <strong>
                    {statistiques.rejetees}
                  </strong>

                  <small>
                    dossiers
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>IA à valider</span>

                  <strong>
                    {
                      reclamationsIaAValider.length
                    }
                  </strong>

                  <small>
                    classifications
                  </small>
                </article>
              </section>

              <section className="admin-overview-grid">
                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Répartition
                      </span>

                      <h2>
                        État des réclamations
                      </h2>
                    </div>
                  </div>

                  <div className="admin-chart">
                    <div className="admin-chart-row">
                      <div className="admin-chart-label">
                        <span>
                          En attente
                        </span>

                        <strong>
                          {
                            statistiques.enAttente
                          }
                        </strong>
                      </div>

                      <div className="admin-bar">
                        <span
                          style={{
                            width: `${
                              statistiques.total >
                              0
                                ? (statistiques.enAttente /
                                    statistiques.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="admin-chart-row">
                      <div className="admin-chart-label">
                        <span>
                          En cours
                        </span>

                        <strong>
                          {
                            statistiques.enCours
                          }
                        </strong>
                      </div>

                      <div className="admin-bar">
                        <span
                          style={{
                            width: `${
                              statistiques.total >
                              0
                                ? (statistiques.enCours /
                                    statistiques.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="admin-chart-row">
                      <div className="admin-chart-label">
                        <span>
                          Traitées
                        </span>

                        <strong>
                          {
                            statistiques.traitees
                          }
                        </strong>
                      </div>

                      <div className="admin-bar">
                        <span
                          style={{
                            width: `${
                              statistiques.total >
                              0
                                ? (statistiques.traitees /
                                    statistiques.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="admin-chart-row">
                      <div className="admin-chart-label">
                        <span>
                          Rejetées
                        </span>

                        <strong>
                          {
                            statistiques.rejetees
                          }
                        </strong>
                      </div>

                      <div className="admin-bar">
                        <span
                          style={{
                            width: `${
                              statistiques.total >
                              0
                                ? (statistiques.rejetees /
                                    statistiques.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>

                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Indicateur
                      </span>

                      <h2>
                        Taux de traitement
                      </h2>
                    </div>
                  </div>

                  <div className="admin-treatment">
                    <div
                      className="admin-treatment-circle"
                      style={
                        {
                          '--treatment-value': `${tauxTraitement}%`,
                        } as CSSProperties
                      }
                    >
                      <strong>
                        {tauxTraitement}%
                      </strong>

                      <span>
                        traité
                      </span>
                    </div>

                    <div className="admin-treatment-text">
                      <p>
                        Réclamations
                        terminées ou
                        rejetées :
                      </p>

                      <strong>
                        {statistiques.traitees +
                          statistiques.rejetees}{' '}
                        /{' '}
                        {statistiques.total}
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="admin-overview-grid">
                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Répartition
                      </span>

                      <h2>
                        Par service
                      </h2>
                    </div>
                  </div>

                  {statistiques.parService
                    .length === 0 ? (
                    <div className="admin-overview-empty">
                      Aucun service
                      renseigné.
                    </div>
                  ) : (
                    <div className="admin-overview-list">
                      {statistiques.parService
                        .slice(0, 6)
                        .map((item) => (
                          <div
                            key={item.service}
                            className="admin-overview-row"
                          >
                            <div className="admin-overview-row-top">
                              <span>
                                {item.service}
                              </span>

                              <strong>
                                {item.total}
                              </strong>
                            </div>

                            <div className="admin-overview-bar">
                              <span
                                style={{
                                  width: `${
                                    statistiques.total >
                                    0
                                      ? (item.total /
                                          statistiques.total) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </article>

                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Répartition
                      </span>

                      <h2>
                        Par département
                      </h2>
                    </div>
                  </div>

                  {statistiques.parDepartement
                    .length === 0 ? (
                    <div className="admin-overview-empty">
                      Aucun département
                      renseigné.
                    </div>
                  ) : (
                    <div className="admin-overview-list">
                      {statistiques.parDepartement
                        .slice(0, 6)
                        .map((item) => (
                          <div
                            key={
                              item.departement
                            }
                            className="admin-overview-row"
                          >
                            <div className="admin-overview-row-top">
                              <span>
                                {
                                  item.departement
                                }
                              </span>

                              <strong>
                                {item.total}
                              </strong>
                            </div>

                            <div className="admin-overview-bar">
                              <span
                                style={{
                                  width: `${
                                    statistiques.total >
                                    0
                                      ? (item.total /
                                          statistiques.total) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </article>
              </section>

              <section className="admin-overview-grid">
                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Répartition
                      </span>

                      <h2>
                        Niveau de priorité
                      </h2>
                    </div>
                  </div>

                  <div className="admin-chart">
                    {prioriteStats.map(
                      (item) => (
                        <div
                          key={item.priorite}
                          className="admin-chart-row"
                        >
                          <div className="admin-chart-label">
                            <span>
                              {priorityLabel(
                                item.priorite,
                              )}
                            </span>

                            <strong>
                              {item.total}
                            </strong>
                          </div>

                          <div className="admin-bar">
                            <span
                              style={{
                                width: `${
                                  statistiques.total >
                                  0
                                    ? (item.total /
                                        statistiques.total) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </article>

                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Vigilance
                      </span>

                      <h2>
                        Réclamations urgentes
                      </h2>
                    </div>
                  </div>

                  <div className="admin-treatment">
                    <div
                      className="admin-treatment-circle"
                      style={
                        {
                          '--treatment-value': `${
                            statistiques.total >
                            0
                              ? Math.round(
                                  ((prioriteStats.find(
                                    (item) =>
                                      item.priorite ===
                                      'URGENTE',
                                  )?.total ?? 0) /
                                    statistiques.total) *
                                    100,
                                )
                              : 0
                          }%`,
                        } as CSSProperties
                      }
                    >
                      <strong>
                        {prioriteStats.find(
                          (item) =>
                            item.priorite ===
                            'URGENTE',
                        )?.total ?? 0}
                      </strong>

                      <span>
                        urgente
                      </span>
                    </div>

                    <div className="admin-treatment-text">
                      <p>
                        Dossiers nécessitant
                        une attention
                        prioritaire.
                      </p>

                      <strong>
                        {prioriteStats.find(
                          (item) =>
                            item.priorite ===
                            'HAUTE',
                        )?.total ?? 0}{' '}
                        haute priorité
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="admin-overview-grid">
                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Intelligence artificielle
                      </span>

                      <h2>
                        Validation des classifications
                      </h2>
                    </div>
                  </div>

                  <div className="admin-ai-overview">
                    <div className="admin-ai-overview-stats">
                      <div className="admin-ai-overview-item">
                        <span>
                          À valider
                        </span>

                        <strong>
                          {
                            reclamationsIaAValider.length
                          }
                        </strong>
                      </div>

                      <div className="admin-ai-overview-item">
                        <span>
                          Validées
                        </span>

                        <strong>
                          {
                            reclamationsIaValidees.length
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="admin-ai-overview-bar">
                      <span
                        style={{
                          width: `${pourcentageIaValidee}%`,
                        }}
                      />
                    </div>

                    <p className="admin-ai-overview-text">
                      {reclamations.length >
                      0 ? (
                        <>
                          {pourcentageIaValidee}%
                          des
                          classifications IA
                          sont validées.
                        </>
                      ) : (
                        'Aucune classification IA disponible.'
                      )}
                    </p>

                    {reclamationsIaAValider.length >
                      0 && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={showIaAValider}
                      >
                        Voir les
                        classifications à
                        valider
                      </button>
                    )}
                  </div>
                </article>

                <article className="admin-overview-card">
                  <div className="admin-overview-header">
                    <div>
                      <span className="admin-overview-label">
                        Contrôle
                      </span>

                      <h2>
                        État de la classification IA
                      </h2>
                    </div>
                  </div>

                  <div className="admin-ai-status-list">
                    <div className="admin-ai-status-row">
                      <span
                        className="agent-ai-badge agent-ai-badge-pending"
                      >
                        IA à valider
                      </span>

                      <strong>
                        {
                          reclamationsIaAValider.length
                        }
                      </strong>
                    </div>

                    <div className="admin-ai-status-row">
                      <span
                        className="agent-ai-badge agent-ai-badge-valid"
                      >
                        Classification validée
                      </span>

                      <strong>
                        {
                          reclamationsIaValidees.length
                        }
                      </strong>
                    </div>
                  </div>
                </article>
              </section>
            </>
          )}

        {loading && (
          <div className="dashboard-message">
            Chargement des réclamations
            et des statistiques...
          </div>
        )}

        {!loading && error && (
          <div
            className="dashboard-message dashboard-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <section
        ref={reclamationsSectionRef}
        id="admin-reclamations-section"
        className="admin-reclamations-section"
      >
            <div className="section-heading">
              <div>
                <h2>
                  Toutes les réclamations
                </h2>

                <p>
                  Vue globale de toutes les
                  réclamations enregistrées.
                </p>
              </div>

              <span className="results-count">
                {reclamationsFiltrees.length}{' '}
                résultat
                {reclamationsFiltrees.length >
                1
                  ? 's'
                  : ''}
              </span>
            </div>

            {reclamationsIaAValider.length >
              0 && (
              <div className="agent-ai-alert admin-ai-alert">
                <div className="agent-ai-alert-icon">
                  <span>!</span>
                </div>

                <div className="agent-ai-alert-content">
                  <strong>
                    {
                      reclamationsIaAValider.length
                    }{' '}
                    classification
                    {reclamationsIaAValider.length >
                    1
                      ? 's'
                      : ''}{' '}
                    IA
                    {reclamationsIaAValider.length >
                    1
                      ? ' sont'
                      : ' est'}{' '}
                    encore à valider.
                  </strong>

                  <span>
                    Vérifiez les propositions de
                    l'intelligence artificielle avant
                    leur validation définitive.
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={showIaAValider}
                >
                  Voir les dossiers
                </button>
              </div>
            )}

            <div className="filters-card">
              <div className="filters-search">
                <label htmlFor="admin-search">
                  Rechercher
                </label>

                <input
                  id="admin-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Référence, titre, citoyen, service, priorité, IA..."
                />
              </div>

              <div className="filters-grid">
                <div className="filter-group">
                  <label htmlFor="admin-statut">
                    Statut
                  </label>

                  <select
                    id="admin-statut"
                    value={statutFilter}
                    onChange={(event) =>
                      setStatutFilter(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Tous les statuts
                    </option>

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
                </div>

                <div className="filter-group">
                  <label htmlFor="admin-priorite">
                    Priorité
                  </label>

                  <select
                    id="admin-priorite"
                    value={prioriteFilter}
                    onChange={(event) =>
                      setPrioriteFilter(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Toutes les priorités
                    </option>

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

                <div className="filter-group">
                  <label htmlFor="admin-service">
                    Service
                  </label>

                  <select
                    id="admin-service"
                    value={serviceFilter}
                    onChange={(event) =>
                      setServiceFilter(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Tous les services
                    </option>

                    {services.map(
                      (service) => (
                        <option
                          key={service}
                          value={service}
                        >
                          {service}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="admin-departement">
                    Département
                  </label>

                  <select
                    id="admin-departement"
                    value={
                      departementFilter
                    }
                    onChange={(event) =>
                      setDepartementFilter(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Tous les départements
                    </option>

                    {departements.map(
                      (departement) => (
                        <option
                          key={departement}
                          value={departement}
                        >
                          {departement}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="admin-ia-validation">
                    Classification IA
                  </label>

                  <select
                    id="admin-ia-validation"
                    value={iaValidationFilter}
                    onChange={(event) =>
                      setIaValidationFilter(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Toutes les classifications
                    </option>

                    <option value="A_VALIDER">
                      IA à valider
                    </option>

                    <option value="VALIDEE">
                      Classification validée
                    </option>
                  </select>
                </div>

                <div className="filter-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={resetFilters}
                    disabled={!filtersActive}
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              <div className="export-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportCsv}
                  disabled={
                    reclamationsFiltrees.length ===
                    0
                  }
                >
                  Exporter CSV
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleExportPdf}
                  disabled={
                    reclamationsFiltrees.length ===
                    0
                  }
                >
                  Exporter PDF
                </button>
              </div>
            </div>

            {reclamationsFiltrees.length ===
            0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                    />

                    <path d="m16 16 4 4" />
                  </svg>
                </div>

                <h3>
                  Aucune réclamation trouvée
                </h3>

                <p>
                  Aucun dossier ne correspond
                  aux critères de recherche
                  sélectionnés.
                </p>

                {filtersActive && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        Référence
                      </th>

                      <th>Titre</th>

                      <th>
                        Citoyen
                      </th>

                      <th>
                        Département
                      </th>

                      <th>
                        Service
                      </th>

                      <th>
                        Priorité
                      </th>

                      <th>
                        Classification IA
                      </th>

                      <th>
                        Statut
                      </th>

                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {reclamationsFiltrees.map(
                      (reclamation) => (
                        <tr
                          key={
                            reclamation.id
                          }
                        >
                          <td>
                            <strong>
                              #
                              {
                                reclamation.numeroClassement
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              reclamation.titre
                            ||
                              'Sans titre'}
                          </td>

                          <td>
                            {reclamation
                              .user?.nom ||
                              'Non renseigné'}
                          </td>

                          <td>
                            {reclamation
                              .departement ||
                              'Non renseigné'}
                          </td>

                          <td>
                            {reclamation
                              .service ||
                              'Non renseigné'}
                          </td>

                          <td>
                            <span
                              className={`priority-badge ${priorityClass(
                                reclamation.priorite ||
                                  'NORMALE',
                              )}`}
                            >
                              {priorityLabel(
                                reclamation.priorite ||
                                  'NORMALE',
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={iaValidationClass(
                                reclamation.iaValidee,
                              )}
                            >
                              {iaValidationLabel(
                                reclamation.iaValidee,
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${statusClass(
                                reclamation.statut,
                              )}`}
                            >
                              {statusLabel(
                                reclamation.statut,
                              )}
                            </span>
                          </td>

                          <td>
                            <Link
                              to={`/reclamations/${reclamation.id}`}
                              className="admin-detail-link"
                            >
                              Voir
                            </Link>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default DashboardAdmin