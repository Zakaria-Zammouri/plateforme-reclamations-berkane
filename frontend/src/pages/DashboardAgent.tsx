import { useEffect, useMemo, useState } from 'react'
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

type FichierJoint = {
  id: number
  nomFichier: string
  chemin: string
  typeMime: string | null
  taille: number | null
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
  titre: string | null
  description: string | null
  statut: string
  priorite: string
  createdAt: string
  updatedAt: string
  user?: User
  fichiers?: FichierJoint[]
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

function DashboardAgent() {
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [reclamations, setReclamations] = useState<Reclamation[]>([])
  const [statistiques, setStatistiques] =
    useState<Statistiques | null>(null)

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [prioriteFilter, setPrioriteFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [departementFilter, setDepartementFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')

    if (!token || !savedUser) {
      navigate('/connexion')
      return
    }

    try {
      const currentUser: User = JSON.parse(savedUser)

      setUser(currentUser)

      if (currentUser.role !== 'AGENT') {
        navigate('/dashboard')
        return
      }
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      navigate('/connexion')
      return
    }

    async function loadDashboard() {
      try {
        const [reclamationsResponse, statistiquesResponse] =
          await Promise.all([
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

        const list: Reclamation[] =
          Array.isArray(reclamationsData)
            ? reclamationsData
            : reclamationsData.data ?? []

        const stats: Statistiques =
          statistiquesData.data ??
          statistiquesData

        setReclamations(
          list.map((reclamation) => ({
            ...reclamation,
            priorite:
              reclamation.priorite || 'NORMALE',
          })),
        )

        setStatistiques({
          ...stats,
          parPriorite:
            Array.isArray(stats.parPriorite)
              ? stats.parPriorite
              : [
                  {
                    priorite: 'BASSE',
                    total: 0,
                  },
                  {
                    priorite: 'NORMALE',
                    total: 0,
                  },
                  {
                    priorite: 'HAUTE',
                    total: 0,
                  },
                  {
                    priorite: 'URGENTE',
                    total: 0,
                  },
                ],
        })
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

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/connexion')
  }

  function getStatusLabel(statut: string) {
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

  function getStatusClass(statut: string) {
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

  function getPriorityLabel(priorite: string) {
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

  function getPriorityClass(priorite: string) {
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

  function formatDate(date: string | null) {
    if (!date) {
      return 'Non renseignée'
    }

    return new Date(date).toLocaleDateString('fr-FR')
  }

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
          .map((item) => item.departement?.trim())
          .filter(
            (value): value is string =>
              Boolean(value),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, 'fr-FR'),
    )
  }, [reclamations])

  const reclamationsFiltrees = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase()

    return reclamations.filter((reclamation) => {
      const matchesSearch =
        !normalizedSearch ||
        String(reclamation.numeroClassement)
          .toLowerCase()
          .includes(normalizedSearch) ||
        (reclamation.titre || '')
          .toLowerCase()
          .includes(normalizedSearch) ||
        (reclamation.description || '')
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
        getPriorityLabel(reclamation.priorite)
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        !statutFilter ||
        reclamation.statut === statutFilter

      const matchesPriority =
        !prioriteFilter ||
        reclamation.priorite === prioriteFilter

      const matchesService =
        !serviceFilter ||
        (reclamation.service || '').trim() ===
          serviceFilter

      const matchesDepartement =
        !departementFilter ||
        (reclamation.departement || '').trim() ===
          departementFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesService &&
        matchesDepartement
      )
    })
  }, [
    reclamations,
    search,
    statutFilter,
    prioriteFilter,
    serviceFilter,
    departementFilter,
  ])

  function resetFilters() {
    setSearch('')
    setStatutFilter('')
    setPrioriteFilter('')
    setServiceFilter('')
    setDepartementFilter('')
  }

  function handleExportCsv() {
    exportReclamationsCsv(
      reclamationsFiltrees,
    )
  }

  function handleExportPdf() {
    exportReclamationsPdf(
      reclamationsFiltrees,
      'AGENT',
    )
  }

  const filtersActive =
    search.trim() !== '' ||
    statutFilter !== '' ||
    prioriteFilter !== '' ||
    serviceFilter !== '' ||
    departementFilter !== ''

  return (
    <main className="agent-page">
      <div className="agent-container">
        <header className="agent-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — ESPACE AGENT
            </span>

            <h1>
              Bonjour{user?.nom ? ` ${user.nom}` : ''}
            </h1>

            <p>
              Consultez et gérez les réclamations transmises à la commune.
            </p>
          </div>

          <div className="agent-header-actions">
            <Link
              to="/"
              className="btn btn-outline"
            >
              Accueil
            </Link>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {!loading && !error && statistiques && (
          <>
            <section className="agent-stats">
              <article className="agent-stat-card">
                <span className="agent-stat-label">
                  Total
                </span>

                <strong>
                  {statistiques.total}
                </strong>

                <span className="agent-stat-text">
                  réclamations
                </span>
              </article>

              <article className="agent-stat-card">
                <span className="agent-stat-label">
                  En attente
                </span>

                <strong>
                  {statistiques.enAttente}
                </strong>

                <span className="agent-stat-text">
                  à traiter
                </span>
              </article>

              <article className="agent-stat-card">
                <span className="agent-stat-label">
                  En cours
                </span>

                <strong>
                  {statistiques.enCours}
                </strong>

                <span className="agent-stat-text">
                  actuellement
                </span>
              </article>

              <article className="agent-stat-card">
                <span className="agent-stat-label">
                  Traitées
                </span>

                <strong>
                  {statistiques.traitees}
                </strong>

                <span className="agent-stat-text">
                  terminées
                </span>
              </article>

              <article className="agent-stat-card">
                <span className="agent-stat-label">
                  Urgentes
                </span>

                <strong>
                  {
                    statistiques.parPriorite.find(
                      (item) =>
                        item.priorite === 'URGENTE',
                    )?.total ?? 0
                  }
                </strong>

                <span className="agent-stat-text">
                  prioritaires
                </span>
              </article>
            </section>

            <section className="agent-overview-grid">
              <article className="agent-overview-card">
                <div className="agent-overview-header">
                  <div>
                    <span className="agent-overview-label">
                      Répartition
                    </span>

                    <h2>Par service</h2>
                  </div>
                </div>

                {statistiques.parService.length === 0 ? (
                  <div className="agent-overview-empty">
                    Aucun service renseigné.
                  </div>
                ) : (
                  <div className="agent-overview-list">
                    {statistiques.parService
                      .slice(0, 6)
                      .map((item) => (
                        <div
                          key={item.service}
                          className="agent-overview-row"
                        >
                          <div className="agent-overview-row-top">
                            <span>
                              {item.service}
                            </span>

                            <strong>
                              {item.total}
                            </strong>
                          </div>

                          <div className="agent-overview-bar">
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

              <article className="agent-overview-card">
                <div className="agent-overview-header">
                  <div>
                    <span className="agent-overview-label">
                      Priorités
                    </span>

                    <h2>
                      Niveau de priorité
                    </h2>
                  </div>
                </div>

                <div className="agent-overview-list">
                  {statistiques.parPriorite.map(
                    (item) => (
                      <div
                        key={item.priorite}
                        className="agent-overview-row"
                      >
                        <div className="agent-overview-row-top">
                          <span
                            className={`priority-badge ${getPriorityClass(
                              item.priorite,
                            )}`}
                          >
                            {getPriorityLabel(
                              item.priorite,
                            )}
                          </span>

                          <strong>
                            {item.total}
                          </strong>
                        </div>

                        <div className="agent-overview-bar">
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
            </section>

            <section className="agent-overview-grid">
              <article className="agent-overview-card">
                <div className="agent-overview-header">
                  <div>
                    <span className="agent-overview-label">
                      Répartition
                    </span>

                    <h2>
                      Par département
                    </h2>
                  </div>
                </div>

                {statistiques.parDepartement.length === 0 ? (
                  <div className="agent-overview-empty">
                    Aucun département renseigné.
                  </div>
                ) : (
                  <div className="agent-overview-list">
                    {statistiques.parDepartement
                      .slice(0, 6)
                      .map((item) => (
                        <div
                          key={item.departement}
                          className="agent-overview-row"
                        >
                          <div className="agent-overview-row-top">
                            <span>
                              {item.departement}
                            </span>

                            <strong>
                              {item.total}
                            </strong>
                          </div>

                          <div className="agent-overview-bar">
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
          </>
        )}

        {loading && (
          <div className="dashboard-message">
            Chargement des réclamations et des statistiques...
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
          <section className="agent-reclamations-section">
            <div className="section-heading">
              <div>
                <h2>
                  Toutes les réclamations
                </h2>

                <p>
                  Consultez les réclamations soumises par les citoyens.
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

            <div className="filters-card">
              <div className="filters-search">
                <label htmlFor="agent-search">
                  Rechercher
                </label>

                <input
                  id="agent-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Référence, titre, citoyen, service, priorité..."
                />
              </div>

              <div className="filters-grid">
                <div className="filter-group">
                  <label htmlFor="agent-statut">
                    Statut
                  </label>

                  <select
                    id="agent-statut"
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
                  <label htmlFor="agent-priorite">
                    Priorité
                  </label>

                  <select
                    id="agent-priorite"
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
                  <label htmlFor="agent-service">
                    Service
                  </label>

                  <select
                    id="agent-service"
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

                    {services.map((service) => (
                      <option
                        key={service}
                        value={service}
                      >
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="agent-departement">
                    Département
                  </label>

                  <select
                    id="agent-departement"
                    value={departementFilter}
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
                    reclamationsFiltrees.length === 0
                  }
                >
                  Exporter CSV
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleExportPdf}
                  disabled={
                    reclamationsFiltrees.length === 0
                  }
                >
                  Exporter PDF
                </button>
              </div>
            </div>

            {reclamationsFiltrees.length === 0 ? (
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
                  Aucun dossier ne correspond aux critères de recherche
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
              <div className="agent-reclamations-list">
                {reclamationsFiltrees.map(
                  (reclamation) => (
                    <Link
                      key={reclamation.id}
                      to={`/reclamations/${reclamation.id}`}
                      className="agent-reclamation-link"
                    >
                      <article className="agent-reclamation-card">
                        <div className="agent-reclamation-number">
                          #{reclamation.numeroClassement}
                        </div>

                        <div className="agent-reclamation-main">
                          <div className="agent-reclamation-title">
                            <div>
                              <h3>
                                {reclamation.titre ||
                                  `Réclamation #${reclamation.numeroClassement}`}
                              </h3>

                              <p>
                                Référence #
                                {reclamation.numeroClassement}
                              </p>
                            </div>

                            <div className="agent-reclamation-badges">
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
                                {getPriorityLabel(
                                  reclamation.priorite,
                                )}
                              </span>
                            </div>
                          </div>

                          {reclamation.description && (
                            <p className="agent-reclamation-description">
                              {reclamation.description}
                            </p>
                          )}

                          <div className="agent-reclamation-meta">
                            <span>
                              Citoyen :{' '}
                              <strong>
                                {reclamation.user?.nom ||
                                  'Non renseigné'}
                              </strong>
                            </span>

                            <span>
                              Département :{' '}
                              <strong>
                                {reclamation.departement ||
                                  'Non renseigné'}
                              </strong>
                            </span>

                            <span>
                              Service :{' '}
                              <strong>
                                {reclamation.service ||
                                  'Non renseigné'}
                              </strong>
                            </span>

                            <span>
                              Déposée le :{' '}
                              <strong>
                                {formatDate(
                                  reclamation.createdAt,
                                )}
                              </strong>
                            </span>
                          </div>

                          <div className="agent-reclamation-footer">
                            <span>
                              {reclamation.fichiers?.length ??
                                0}{' '}
                              fichier
                              {(reclamation.fichiers?.length ??
                                0) > 1
                                ? 's'
                                : ''}
                            </span>

                            <span className="agent-view-link">
                              Voir le détail
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ),
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default DashboardAgent