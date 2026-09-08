import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import '../App.css'

type FichierJoint = {
  id: number
  nomFichier: string
  chemin: string
  typeMime: string | null
  taille: number | null
  createdAt: string
  reclamationId: number
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
  titre: string
  description: string
  createdAt: string
  updatedAt: string
  fichiers?: FichierJoint[]
}

type User = {
  id: number
  nom: string
  email: string
  role: string
}

type Notification = {
  id: number
  userId: number
  reclamationId: number | null
  titre: string
  message: string
  type: string
  lu: boolean
  createdAt: string
  reclamation?: {
    id: number
    numeroClassement: number
    titre: string
    statut: string
  } | null
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
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

function ReclamationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] =
    useState<User | null>(null)

  const [reclamations, setReclamations] =
    useState<Reclamation[]>([])

  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [notificationError, setNotificationError] =
    useState('')

  const [notificationsOpen, setNotificationsOpen] =
    useState(false)

  const [notificationLoading, setNotificationLoading] =
    useState(false)

  function clearSessionAndRedirect() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    navigate('/connexion', {
      replace: true,
    })
  }

  async function parseErrorResponse(
    response: Response,
    fallback: string,
  ) {
    const data =
      await response
        .json()
        .catch(() => null)

    return new Error(
      Array.isArray(data?.message)
        ? data.message.join(', ')
        : data?.message || fallback,
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
        const parsedUser: User =
          JSON.parse(savedUser)

        setUser(parsedUser)
      } catch {
        clearSessionAndRedirect()
        return
      }
    }

    async function loadData() {
      try {
        const [
          reclamationsResponse,
          notificationsResponse,
        ] = await Promise.all([
          fetch(
            'http://localhost:3000/reclamations/mes',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch(
            'http://localhost:3000/notifications',
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
          notificationsResponse.status === 401
        ) {
          clearSessionAndRedirect()
          return
        }

        const reclamationsData =
          await reclamationsResponse
            .json()
            .catch(() => null)

        if (!reclamationsResponse.ok) {
          throw new Error(
            Array.isArray(
              reclamationsData?.message,
            )
              ? reclamationsData.message.join(', ')
              : reclamationsData?.message ||
                  'Impossible de récupérer vos réclamations.',
          )
        }

        const reclamationList: Reclamation[] =
          Array.isArray(
            reclamationsData,
          )
            ? reclamationsData
            : reclamationsData?.data ?? []

        setReclamations(
          reclamationList,
        )

        const notificationsData =
          await notificationsResponse
            .json()
            .catch(() => null)

        if (!notificationsResponse.ok) {
          throw new Error(
            Array.isArray(
              notificationsData?.message,
            )
              ? notificationsData.message.join(', ')
              : notificationsData?.message ||
                  'Impossible de récupérer les notifications.',
          )
        }

        const notificationList: Notification[] =
          Array.isArray(
            notificationsData,
          )
            ? notificationsData
            : notificationsData?.data ?? []

        setNotifications(
          notificationList,
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

    loadData()
  }, [navigate])

  function handleLogout() {
    clearSessionAndRedirect()
  }

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

  function formatDate(
    date: string,
  ) {
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
    ).toLocaleString(
      'fr-FR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      },
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
              'application/octet-stream',
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

  async function handleMarkNotificationAsRead(
    notification: Notification,
  ) {
    if (notification.lu) {
      return
    }

    const token =
      localStorage.getItem(
        'access_token',
      )

    if (!token) {
      clearSessionAndRedirect()
      return
    }

    try {
      setNotificationLoading(true)
      setNotificationError('')

      const response =
        await fetch(
          `http://localhost:3000/notifications/${notification.id}/lue`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

      if (
        response.status === 401
      ) {
        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        throw await parseErrorResponse(
          response,
          'Impossible de marquer la notification comme lue.',
        )
      }

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              notification.id
                ? {
                    ...item,
                    lu: true,
                  }
                : item,
          ),
      )
    } catch (err) {
      setNotificationError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier la notification.',
      )
    } finally {
      setNotificationLoading(false)
    }
  }

  async function handleMarkAllNotificationsAsRead() {
    const token =
      localStorage.getItem(
        'access_token',
      )

    if (!token) {
      clearSessionAndRedirect()
      return
    }

    try {
      setNotificationLoading(true)
      setNotificationError('')

      const response =
        await fetch(
          'http://localhost:3000/notifications/toutes/lues',
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

      if (
        response.status === 401
      ) {
        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        throw await parseErrorResponse(
          response,
          'Impossible de marquer les notifications comme lues.',
        )
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              lu: true,
            }),
          ),
      )
    } catch (err) {
      setNotificationError(
        err instanceof Error
          ? err.message
          : 'Impossible de modifier les notifications.',
      )
    } finally {
      setNotificationLoading(false)
    }
  }

  async function handleNotificationClick(
    notification: Notification,
  ) {
    await handleMarkNotificationAsRead(
      notification,
    )

    if (
      notification.reclamationId
    ) {
      setNotificationsOpen(false)

      navigate(
        `/reclamations/${notification.reclamationId}`,
      )
    }
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.lu,
    ).length

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — ESPACE CITOYEN
            </span>

            <h1>
              Bonjour
              {user?.nom
                ? ` ${user.nom}`
                : ''}
            </h1>

            <p>
              Gérez vos réclamations et suivez leur
              traitement.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) =>
                      !current,
                  )
                }
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} notification${
                        unreadCount > 1
                          ? 's'
                          : ''
                      } non lue${
                        unreadCount > 1
                          ? 's'
                          : ''
                      }`
                    : 'Notifications'
                }
                aria-expanded={
                  notificationsOpen
                }
              >
                <BellIcon />

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99
                      ? '99+'
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <h2>
                        Notifications
                      </h2>

                      <p>
                        {unreadCount === 0
                          ? 'Toutes vos notifications sont lues.'
                          : `${unreadCount} notification${
                              unreadCount > 1
                                ? 's'
                                : ''
                            } non lue${
                              unreadCount > 1
                                ? 's'
                                : ''
                            }`}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notification-mark-all"
                        onClick={
                          handleMarkAllNotificationsAsRead
                        }
                        disabled={
                          notificationLoading
                        }
                      >
                        <CheckIcon />
                        Tout lire
                      </button>
                    )}
                  </div>

                  {notificationError && (
                    <div
                      className="notification-error"
                      role="alert"
                    >
                      {notificationError}
                    </div>
                  )}

                  {notifications.length ===
                  0 ? (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">
                        <BellIcon />
                      </div>

                      <strong>
                        Aucune notification
                      </strong>

                      <p>
                        Vous recevrez ici les mises à jour
                        concernant vos réclamations.
                      </p>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map(
                        (
                          notification,
                        ) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            className={`notification-item ${
                              notification.lu
                                ? 'notification-read'
                                : 'notification-unread'
                            }`}
                            onClick={() =>
                              handleNotificationClick(
                                notification,
                              )
                            }
                            disabled={
                              notificationLoading
                            }
                          >
                            <span className="notification-item-icon">
                              <BellIcon />
                            </span>

                            <span className="notification-item-content">
                              <span className="notification-item-top">
                                <strong>
                                  {
                                    notification.titre
                                  }
                                </strong>

                                {!notification.lu && (
                                  <span className="notification-dot" />
                                )}
                              </span>

                              <span className="notification-item-message">
                                {
                                  notification.message
                                }
                              </span>

                              <span className="notification-item-date">
                                {formatDateTime(
                                  notification.createdAt,
                                )}
                              </span>
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </header>

        <section className="dashboard-actions">
          <Link
            to="/reclamations/nouvelle"
            className="btn btn-primary btn-large"
          >
            <PlusIcon />

            <span>
              Nouvelle réclamation
            </span>
          </Link>

          <Link
            to="/"
            className="btn btn-outline btn-large"
          >
            Accueil
          </Link>
        </section>

        {loading && (
          <div className="dashboard-message">
            Chargement de vos réclamations...
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
          <section className="reclamations-section">
            <div className="section-heading">
              <div>
                <h2>
                  Mes réclamations
                </h2>

                <p>
                  {reclamations.length ===
                  0
                    ? 'Vous n’avez encore aucune réclamation.'
                    : `${reclamations.length} réclamation${
                        reclamations.length >
                        1
                          ? 's'
                          : ''
                      }`}
                </p>
              </div>
            </div>

            {reclamations.length ===
            0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ReclamationIcon />
                </div>

                <h3>
                  Aucune réclamation
                </h3>

                <p>
                  Vous pouvez déposer votre première
                  réclamation auprès de la Commune de
                  Berkane.
                </p>

                <Link
                  to="/reclamations/nouvelle"
                  className="btn btn-primary"
                >
                  Déposer une réclamation
                </Link>
              </div>
            ) : (
              <div className="reclamations-list">
                {reclamations.map(
                  (
                    reclamation,
                  ) => (
                    <Link
                      key={
                        reclamation.id
                      }
                      to={`/reclamations/${reclamation.id}`}
                      className="reclamation-card-link"
                    >
                      <article className="reclamation-card">
                        <div className="reclamation-main">
                          <div className="reclamation-number">
                            #
                            {
                              reclamation.numeroClassement
                            }
                          </div>

                          <div className="reclamation-content">
                            <div className="reclamation-top">
                              <div>
                                <h3>
                                  {reclamation.titre ||
                                    `Réclamation #${reclamation.numeroClassement}`}
                                </h3>

                                <p className="reclamation-reference">
                                  Référence #
                                  {
                                    reclamation.numeroClassement
                                  }
                                </p>
                              </div>

                              <span
                                className={`status-badge ${getStatusClass(
                                  reclamation.statut,
                                )}`}
                              >
                                {getStatusLabel(
                                  reclamation.statut,
                                )}
                              </span>
                            </div>

                            {reclamation.description && (
                              <p className="reclamation-description">
                                {
                                  reclamation.description
                                }
                              </p>
                            )}

                            <div className="reclamation-details">
                              {reclamation.departement && (
                                <span>
                                  Département:{' '}
                                  <strong>
                                    {
                                      reclamation.departement
                                    }
                                  </strong>
                                </span>
                              )}

                              {reclamation.service && (
                                <span>
                                  Service:{' '}
                                  <strong>
                                    {
                                      reclamation.service
                                    }
                                  </strong>
                                </span>
                              )}

                              {reclamation.misEnCause && (
                                <span>
                                  Mis en cause:{' '}
                                  <strong>
                                    {
                                      reclamation.misEnCause
                                    }
                                  </strong>
                                </span>
                              )}

                              {reclamation.numeroBureauOrdre && (
                                <span>
                                  Bureau d’ordre:{' '}
                                  <strong>
                                    {
                                      reclamation.numeroBureauOrdre
                                    }
                                  </strong>
                                </span>
                              )}
                            </div>

                            <p className="reclamation-date">
                              Déposée le{' '}
                              {formatDate(
                                reclamation.createdAt,
                              )}
                            </p>

                            {reclamation.fichiers &&
                              reclamation.fichiers.length >
                                0 && (
                                <div className="reclamation-files">
                                  <h4>
                                    Fichiers joints
                                  </h4>

                                  <div className="file-list">
                                    {reclamation.fichiers.map(
                                      (
                                        fichier,
                                      ) => (
                                        <div
                                          key={
                                            fichier.id
                                          }
                                          className="file-item"
                                          onClick={(
                                            event,
                                          ) =>
                                            event.stopPropagation()
                                          }
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

                                          <a
                                            href={getFileUrl(
                                              reclamation.id,
                                              fichier.id,
                                            )}
                                            className="file-action"
                                            onClick={(
                                              event,
                                            ) =>
                                              handleDownloadFile(
                                                reclamation.id,
                                                fichier,
                                                event,
                                              )
                                            }
                                          >
                                            Voir
                                          </a>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            <div className="reclamation-open">
                              Voir le détail →
                            </div>
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

export default Dashboard