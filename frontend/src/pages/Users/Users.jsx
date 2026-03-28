import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, KeyRound, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
  getUsers, createUser, deleteUser,
  resetPassword, updateUserRole
} from '../../api/users'
import Modal from '../../components/Modal/Modal'
import styles from './Users.module.css'

const roles = ['Etudiant', 'Professeur', 'Personnel administratif']

const emptyForm = {
  firstname: '', surname: '', email: '', role: 'Etudiant'
}

export default function Users() {
  const { token } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalAdd, setModalAdd] = useState(false)
  const [modalCreated, setModalCreated] = useState(false)
  const [createdPassword, setCreatedPassword] = useState(null)
  const [modalDelete, setModalDelete] = useState(false)
  const [modalReset, setModalReset] = useState(false)
  const [modalRole, setModalRole] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newRole, setNewRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [resetResult, setResetResult] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers(token)
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await createUser(token, form)
      setModalAdd(false)
      setForm(emptyForm)
      setCreatedPassword(result.generated_password)
      setModalCreated(true)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await deleteUser(token, selectedUser.id)
      setModalDelete(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async () => {
    setSubmitting(true)
    try {
      const result = await resetPassword(token, selectedUser.id)
      setResetResult(result.new_password)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleUpdate = async () => {
    setSubmitting(true)
    try {
      await updateUserRole(token, selectedUser.id, newRole)
      setModalRole(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const roleColors = {
    'Etudiant': styles.roleEtudiant,
    'Professeur': styles.roleProfesseur,
    'Personnel administratif': styles.rolePersonnel
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Utilisateurs</h1>
        <button className={styles.btnPrimary} onClick={() => {
          setForm(emptyForm)
          setError(null)
          setModalAdd(true)
        }}>
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id}>
                <td className={styles.userName}>
                  <div className={styles.userAvatar}>
                    {user.firstname?.[0]}{user.surname?.[0]}
                  </div>
                  {user.firstname} {user.surname}
                </td>
                <td className={styles.muted}>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${roleColors[user.role] || ''}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      title="Changer le rôle"
                      onClick={() => {
                        setSelectedUser(user)
                        setNewRole(user.role)
                        setModalRole(true)
                      }}
                    >
                      <Shield size={14} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      title="Réinitialiser le mot de passe"
                      onClick={() => {
                        setSelectedUser(user)
                        setResetResult(null)
                        setModalReset(true)
                      }}
                    >
                      <KeyRound size={14} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      title="Supprimer"
                      onClick={() => {
                        setSelectedUser(user)
                        setModalDelete(true)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      <Modal isOpen={modalAdd} onClose={() => setModalAdd(false)} title="Nouvel utilisateur">
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Prénom *</label>
              <input name="firstname" className={styles.input} value={form.firstname} onChange={handleFormChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nom *</label>
              <input name="surname" className={styles.input} value={form.surname} onChange={handleFormChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input name="email" type="email" className={styles.input} value={form.email} onChange={handleFormChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Rôle *</label>
              <select name="role" className={styles.input} value={form.role} onChange={handleFormChange}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button type="button" className={styles.btnOutline} onClick={() => setModalAdd(false)}>
              Annuler
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Suppression */}
      <Modal isOpen={modalDelete} onClose={() => setModalDelete(false)} title="Supprimer l'utilisateur" size="sm">
        <p className={styles.confirmText}>
          Voulez-vous vraiment supprimer <strong>{selectedUser?.firstname} {selectedUser?.surname}</strong> ?
          Cette action est irréversible.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.btnOutline} onClick={() => setModalDelete(false)}>Annuler</button>
          <button className={styles.btnDanger} onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </Modal>

      {/* Modal Reset mot de passe */}
      <Modal isOpen={modalReset} onClose={() => { setModalReset(false); setResetResult(null) }} title="Réinitialiser le mot de passe" size="sm">
        {!resetResult ? (
          <>
            <p className={styles.confirmText}>
              Réinitialiser le mot de passe de <strong>{selectedUser?.firstname} {selectedUser?.surname}</strong> ?
              Un mot de passe temporaire sera généré.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.btnOutline} onClick={() => setModalReset(false)}>Annuler</button>
              <button className={styles.btnPrimary} onClick={handleReset} disabled={submitting}>
                {submitting ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.confirmText}>Mot de passe temporaire généré :</p>
            <div className={styles.tempPassword}>{resetResult}</div>
            <p className={styles.hint}>Communiquez ce mot de passe à l'utilisateur. Il pourra le changer depuis son profil.</p>
            <div className={styles.confirmActions}>
              <button className={styles.btnPrimary} onClick={() => { setModalReset(false); setResetResult(null) }}>
                Fermer
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal Rôle */}
      <Modal isOpen={modalRole} onClose={() => setModalRole(false)} title="Changer le rôle" size="sm">
        <div className={styles.field} style={{ marginBottom: '20px' }}>
          <label className={styles.label}>Nouveau rôle pour {selectedUser?.firstname}</label>
          <select
            className={styles.input}
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className={styles.confirmActions}>
          <button className={styles.btnOutline} onClick={() => setModalRole(false)}>Annuler</button>
          <button className={styles.btnPrimary} onClick={handleRoleUpdate} disabled={submitting}>
            {submitting ? 'Enregistrement...' : 'Confirmer'}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={modalCreated}
        onClose={() => { setModalCreated(false); setCreatedPassword(null) }}
        title="Utilisateur créé"
        size="sm"
      >
        <p className={styles.confirmText}>
          Le nouvel utilisateur a été ajouté. Voici son mot de passe temporaire :
        </p>
        <div className={styles.tempPassword}>{createdPassword}</div>
        <p className={styles.hint}>
          Communiquez ce mot de passe à l'utilisateur. Il devra ensuite le changer depuis son profil.
        </p>
        <div className={styles.confirmActions}>
          <button
            className={styles.btnPrimary}
            onClick={() => { setModalCreated(false); setCreatedPassword(null) }}
          >
            Fermer
          </button>
        </div>
      </Modal>
    </div>
  )
}