import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

type User = {
  id: number
  nom: string
  email: string
  role: string
  actif: boolean
  createdAt: string
  updatedAt: string
}

function GestionUtilisateurs() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function clearSessionAndRedirect() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    navigate('/connexion', {
      replace: true,
    })
  }

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
      clearSessionAndRedirect()
      return
    }

    if (currentUser.role !== 'ADMIN') {
      navigate('/dashboard')
      return
    }

    async function loadUsers() {
      try {
        const response = await fetch(
          'http://localhost:3000/users',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        const data = await response.json()

        if (response.status === 401) {
          clearSessionAndRedirect()
          return
        }

        if (!response.ok) {
          throw new Error(
            Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message ||
                  'Impossible de récupérer les utilisateurs.',
          )
        }

        const list: User[] = Array.isArray(data)
          ? data
          : data.data ?? []

        setUsers(list)
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

    loadUsers()
  }, [navigate])

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  function roleLabel(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur'

      case 'AGENT':
        return 'Agent'

      case 'CITOYEN':
        return 'Citoyen'

      default:
        return role
    }
  }

  function roleClass(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'role-admin'

      case 'AGENT':
        return 'role-agent'

      default:
        return 'role-citoyen'
    }
  }

  async function updateUserRole(
    userId: number,
    newRole: string,
  ) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      clearSessionAndRedirect()
      return
    }

    setError('')
    setSuccess('')
    setSavingId(userId)

    try {
      const response = await fetch(
        `http://localhost:3000/users/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
                'Impossible de modifier le rôle.',
        )
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: data.role ?? newRole,
              }
            : user,
        ),
      )

      setSuccess(
        'Le rôle de l’utilisateur a été modifié avec succès.',
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function toggleUserStatus(user: User) {
    const token = localStorage.getItem('access_token')

    if (!token) {
      clearSessionAndRedirect()
      return
    }

    const newStatus = !user.actif
    const action = newStatus ? 'activer' : 'désactiver'

    const confirmed = window.confirm(
      `Voulez-vous vraiment ${action} le compte de "${user.nom}" ?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')
    setSavingId(user.id)

    try {
      const response = await fetch(
        `http://localhost:3000/users/${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            actif: newStatus,
          }),
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
                `Impossible de ${action} le compte.`,
        )
      }

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                actif:
                  typeof data.actif === 'boolean'
                    ? data.actif
                    : newStatus,
              }
            : item,
        ),
      )

      setSuccess(
        newStatus
          ? `Le compte de "${user.nom}" a été activé avec succès.`
          : `Le compte de "${user.nom}" a été désactivé avec succès.`,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function deleteUser(user: User) {
    const currentUserData = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')

    if (!token) {
      clearSessionAndRedirect()
      return
    }

    let currentUserId: number | null = null

    if (currentUserData) {
      try {
        const currentUser: User =
          JSON.parse(currentUserData)

        currentUserId = currentUser.id
      } catch {
        currentUserId = null
      }
    }

    if (
      currentUserId !== null &&
      user.id === currentUserId
    ) {
      setError(
        'Vous ne pouvez pas supprimer votre propre compte depuis cette page.',
      )
      return
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'utilisateur "${user.nom}" ?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')
    setDeletingId(user.id)

    try {
      const response = await fetch(
        `http://localhost:3000/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (response.status === 401) {
        clearSessionAndRedirect()
        return
      }

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
                'Impossible de supprimer l’utilisateur.',
        )
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item.id !== user.id,
        ),
      )

      setSuccess(
        `L’utilisateur "${user.nom}" a été supprimé avec succès.`,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <span className="dashboard-eyebrow">
              SAWTI — ADMINISTRATION
            </span>

            <h1>Gestion des utilisateurs</h1>

            <p>
              Consultez les comptes et gérez leurs rôles et leur état.
            </p>
          </div>

          <div className="admin-header-actions">
            <Link
              to="/admin/dashboard"
              className="btn btn-outline"
            >
              Retour au dashboard
            </Link>
          </div>
        </header>

        {error && (
          <div
            className="dashboard-message dashboard-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="admin-success-message"
            role="status"
          >
            {success}
          </div>
        )}

        {loading ? (
          <div className="dashboard-message">
            Chargement des utilisateurs...
          </div>
        ) : (
          <section className="admin-reclamations-section">
            <div className="section-heading">
              <div>
                <h2>Utilisateurs</h2>

                <p>
                  {users.length} compte
                  {users.length > 1 ? 's' : ''} enregistré
                  {users.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="empty-state">
                <h3>Aucun utilisateur</h3>

                <p>
                  Aucun compte utilisateur n'est disponible.
                </p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle actuel</th>
                      <th>Modifier le rôle</th>
                      <th>État du compte</th>
                      <th>Créé le</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>
                            {user.nom}
                          </strong>
                        </td>

                        <td>
                          {user.email}
                        </td>

                        <td>
                          <span
                            className={`user-role-badge ${roleClass(
                              user.role,
                            )}`}
                          >
                            {roleLabel(user.role)}
                          </span>
                        </td>

                        <td>
                          <select
                            className="admin-role-select"
                            value={user.role}
                            disabled={
                              savingId === user.id ||
                              deletingId === user.id
                            }
                            onChange={(event) =>
                              updateUserRole(
                                user.id,
                                event.target.value,
                              )
                            }
                          >
                            <option value="CITOYEN">
                              Citoyen
                            </option>

                            <option value="AGENT">
                              Agent
                            </option>

                            <option value="ADMIN">
                              Administrateur
                            </option>
                          </select>

                          {savingId === user.id && (
                            <span className="admin-saving-text">
                              Enregistrement...
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="user-status-cell">
                            <span
                              className={
                                user.actif
                                  ? 'user-status-badge user-status-active'
                                  : 'user-status-badge user-status-inactive'
                              }
                            >
                              {user.actif
                                ? 'Actif'
                                : 'Désactivé'}
                            </span>

                            <button
                              type="button"
                              className={
                                user.actif
                                  ? 'admin-status-button admin-status-disable'
                                  : 'admin-status-button admin-status-enable'
                              }
                              disabled={
                                savingId === user.id ||
                                deletingId === user.id
                              }
                              onClick={() =>
                                toggleUserStatus(user)
                              }
                            >
                              {user.actif
                                ? 'Désactiver'
                                : 'Activer'}
                            </button>
                          </div>
                        </td>

                        <td>
                          {formatDate(
                            user.createdAt,
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-delete-button"
                            disabled={
                              deletingId === user.id ||
                              savingId === user.id
                            }
                            onClick={() =>
                              deleteUser(user)
                            }
                          >
                            {deletingId === user.id
                              ? 'Suppression...'
                              : 'Supprimer'}
                          </button>
                        </td>
                      </tr>
                    ))}
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

export default GestionUtilisateurs