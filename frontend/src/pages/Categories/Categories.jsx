import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getCategories, createCategory, deleteCategory } from '../../api/books'
import Modal from '../../components/Modal/Modal'
import styles from './Categories.module.css'

export default function Categories() {
  const { token } = useAuth()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAdd, setModalAdd] = useState(false)
  const [modalDelete, setModalDelete] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories(token)
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createCategory(token, form)
      setModalAdd(false)
      setForm({ name: '', description: '' })
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await deleteCategory(token, selectedCategory.id)
      setModalDelete(false)
      fetchCategories()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Catégories de livres</h1>
        <button className={styles.btnPrimary} onClick={() => {
          setForm({ name: '', description: '' })
          setError(null)
          setModalAdd(true)
        }}>
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      <div className={styles.grid}>
        {categories.length === 0 ? (
          <div className={styles.empty}>Aucune catégorie pour le moment.</div>
        ) : categories.map(cat => (
          <div key={cat.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardName}>{cat.name}</span>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  setSelectedCategory(cat)
                  setModalDelete(true)
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {cat.description && (
              <p className={styles.cardDesc}>{cat.description}</p>
            )}
            <span className={styles.cardMeta}>
              Créée le {new Date(cat.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        ))}
      </div>

      <Modal isOpen={modalAdd} onClose={() => setModalAdd(false)} title="Nouvelle catégorie" size="sm">
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nom *</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.input}
              rows={3}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
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

      <Modal isOpen={modalDelete} onClose={() => setModalDelete(false)} title="Supprimer la catégorie" size="sm">
        <p className={styles.confirmText}>
          Voulez-vous vraiment supprimer la catégorie <strong>{selectedCategory?.name}</strong> ?
          Les livres associés n'auront plus de catégorie.
        </p>
        <div className={styles.confirmActions}>
          <button className={styles.btnOutline} onClick={() => setModalDelete(false)}>Annuler</button>
          <button className={styles.btnDanger} onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}