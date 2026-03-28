import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateMyPassword } from '../../api/users'
import { User } from 'lucide-react'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, token } = useAuth()

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (form.new_password !== form.confirm_password) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setSubmitting(true)
    try {
      await updateMyPassword(token, {
        old_password: form.old_password,
        new_password: form.new_password
      })
      setSuccess(true)
      setForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.firstname?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()
  }

  const roleLabels = {
    'Etudiant': 'Étudiant',
    'Professeur': 'Professeur',
    'Personnel administratif': 'Personnel administratif'
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mon profil</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{getInitials()}</div>
            <div>
              <p className={styles.name}>{user?.firstname} {user?.surname}</p>
              <span className={styles.roleBadge}>{roleLabels[user?.role] || user?.role}</span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Prénom</span>
              <span className={styles.infoValue}>{user?.firstname}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nom</span>
              <span className={styles.infoValue}>{user?.surname}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Rôle</span>
              <span className={styles.infoValue}>{roleLabels[user?.role] || user?.role}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Changer le mot de passe</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Mot de passe actuel</label>
              <input
                type="password"
                name="old_password"
                className={styles.input}
                value={form.old_password}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nouveau mot de passe</label>
              <input
                type="password"
                name="new_password"
                className={styles.input}
                value={form.new_password}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                name="confirm_password"
                className={styles.input}
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>Mot de passe mis à jour avec succès.</div>}

            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Enregistrement...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}