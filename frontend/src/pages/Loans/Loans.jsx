import { useEffect, useState, useCallback } from 'react'
import { Plus, RotateCcw, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getLoans, getMyLoans, createLoan, returnLoan, checkOverdue } from '../../api/loans'
import { getBooks } from '../../api/books'
import { getUsers } from '../../api/users'
import Modal from '../../components/Modal/Modal'
import Badge from '../../components/Badge/Badge'
import styles from './Loans.module.css'

const tabs = ['Tous', 'En cours', 'En retard', 'Retournés']
const statusMap = {
  'En cours': 'EN_COURS',
  'En retard': 'EN_RETARD',
  'Retournés': 'RETOURNE'
}

export default function Loans() {
  const { token, isStaff } = useAuth()

  const [loans, setLoans] = useState([])
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Tous')

  const [modalAdd, setModalAdd] = useState(false)
  const [modalReturn, setModalReturn] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const today = new Date()
  const defaultDueDate = new Date(today.setDate(today.getDate() + 15))
    .toISOString().split('T')[0]

  const [form, setForm] = useState({
    book_id: '',
    user_id: '',
    due_date: defaultDueDate
  })

  const fetchLoans = useCallback(async () => {
    try {
      const data = isStaff()
        ? await getLoans(token)
        : await getMyLoans(token)
      setLoans(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [isStaff, token])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  useEffect(() => {
    if (!isStaff()) return
    Promise.all([getBooks(token), getUsers(token)])
      .then(([booksData, usersData]) => {
        setBooks(booksData.filter(b => b.available_copies > 0))
        setUsers(usersData)
      })
      .catch(console.error)
  }, [isStaff, token])

  const booksMap = Object.fromEntries(books.map(b => [b.id, b]))
  const usersMap = Object.fromEntries(users.map(u => [u.id, u]))
  
  const filteredLoans = activeTab === 'Tous'
    ? loans
    : loans.filter(l => l.status === statusMap[activeTab])

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createLoan(token, {
        book_id: parseInt(form.book_id),
        user_id: form.user_id,
        due_date: form.due_date
      })
      setModalAdd(false)
      setForm({ book_id: '', user_id: '', due_date: defaultDueDate })
      fetchLoans()
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturnOpen = (loan) => {
    setSelectedLoan(loan)
    setModalReturn(true)
  }

  const handleReturn = async () => {
    setSubmitting(true)
    try {
      await returnLoan(token, selectedLoan.id)
      setModalReturn(false)
      fetchLoans()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckOverdue = async () => {
    try {
      await checkOverdue(token)
      fetchLoans()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className={styles.loading}>Chargement...</div>

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>
          {isStaff() ? 'Gestion des emprunts' : 'Mes emprunts'}
        </h1>
        {isStaff() && (
          <div className={styles.topbarActions}>
            <button className={styles.btnOutline} onClick={handleCheckOverdue}>
              <AlertCircle size={16} />
              Vérifier les retards
            </button>
            <button className={styles.btnPrimary} onClick={() => {
              setError(null)
              setModalAdd(true)
            }}>
              <Plus size={16} />
              Enregistrer un emprunt
            </button>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className={styles.tabCount}>
              {tab === 'Tous'
                ? loans.length
                : loans.filter(l => l.status === statusMap[tab]).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {isStaff() && <th>Emprunteur</th>}
              <th>Livre</th>
              <th>Date emprunt</th>
              <th>Retour prévu</th>
              <th>Retour effectif</th>
              <th>Statut</th>
              {isStaff() && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={isStaff() ? 7 : 5} className={styles.empty}>
                  Aucun emprunt trouvé.
                </td>
              </tr>
            ) : filteredLoans.map(loan => (
              <tr key={loan.id}>
                {isStaff() && (
                  <td className={styles.muted}>
                    {usersMap[loan.user_id]
                      ? `${usersMap[loan.user_id].firstname} ${usersMap[loan.user_id].surname}`
                      : loan.user_id.toString().slice(0, 8) + '...'}
                  </td>
                )}
                <td>
                  {booksMap[loan.book_id]?.title || `Livre #${loan.book_id}`}
                </td>
                <td className={styles.muted}>
                  {new Date(loan.loan_date).toLocaleDateString('fr-FR')}
                </td>
                <td className={loan.status === 'EN_RETARD' ? styles.overdue : styles.muted}>
                  {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                </td>
                <td className={styles.muted}>
                  {loan.return_date
                    ? new Date(loan.return_date).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td><Badge status={loan.status} /></td>
                {isStaff() && (
                  <td>
                    {loan.status !== 'RETOURNE' && (
                      <button
                        className={styles.returnBtn}
                        onClick={() => handleReturnOpen(loan)}
                      >
                        <RotateCcw size={13} />
                        Retour
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Emprunt */}
      <Modal
        isOpen={modalAdd}
        onClose={() => setModalAdd(false)}
        title="Enregistrer un emprunt"
      >
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Livre *</label>
            <select name="book_id" className={styles.input} value={form.book_id} onChange={handleFormChange} required>
              <option value="">— Sélectionner un livre —</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.available_copies} dispo)
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Emprunteur *</label>
            <select name="user_id" className={styles.input} value={form.user_id} onChange={handleFormChange} required>
              <option value="">— Sélectionner un utilisateur —</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstname} {user.surname} — {user.role}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Date de retour prévue *</label>
            <input
              name="due_date"
              type="date"
              className={styles.input}
              value={form.due_date}
              onChange={handleFormChange}
              required
            />
            <span className={styles.hint}>Par défaut 15 jours — modifiable</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button type="button" className={styles.btnOutline} onClick={() => setModalAdd(false)}>
              Annuler
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Retour */}
      <Modal
        isOpen={modalReturn}
        onClose={() => setModalReturn(false)}
        title="Confirmer le retour"
        size="sm"
      >
        <p className={styles.deleteText}>
          Confirmer le retour du livre <strong>#{selectedLoan?.book_id}</strong> ?
        </p>
        <div className={styles.deleteActions}>
          <button className={styles.btnOutline} onClick={() => setModalReturn(false)}>
            Annuler
          </button>
          <button className={styles.btnPrimary} onClick={handleReturn} disabled={submitting}>
            {submitting ? 'Traitement...' : 'Confirmer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}