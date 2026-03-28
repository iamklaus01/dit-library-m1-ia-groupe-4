import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, ArrowLeftRight, User,
  UserPlus, Clock, Plus, Library
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getBooks } from '../../api/books'
import { getLoans, getMyLoans } from '../../api/loans'
import Badge from '../../components/Badge/Badge'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, token, isStaff } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksData = await getBooks(token)
        setBooks(booksData)
        const loansData = isStaff()
          ? await getLoans(token)
          : await getMyLoans(token)
        setLoans(loansData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isStaff, token])

  const totalBooks = books.length
  const availableBooks = books.reduce((sum, b) => sum + b.available_copies, 0)
  const activeLoans = loans.filter(l => l.status === 'EN_COURS').length
  const overdueLoans = loans.filter(l => l.status === 'EN_RETARD').length

  const recentLoans = [...loans]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const recentBooks = [...books]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const staffActions = [
    { label: 'Ajouter un livre', icon: Plus, path: '/la-bibliotheque' },
    { label: 'Enregistrer un emprunt', icon: ArrowLeftRight, path: '/emprunts' },
    { label: 'Nouvel utilisateur', icon: UserPlus, path: '/users' },
    { label: 'Vérifier les retards', icon: Clock, path: '/emprunts' },
  ]

  const userActions = [
    { label: 'Voir les livres', icon: BookOpen, path: '/la-bibliotheque' },
    { label: 'Mes emprunts', icon: ArrowLeftRight, path: '/emprunts' },
    { label: 'Mon profil', icon: User, path: '/profil' },
  ]

  const actions = isStaff() ? staffActions : userActions

  if (loading) return <div className={styles.loading}>Chargement...</div>

  return (
    <div className={styles.page}>

      <div className={styles.topbar}>
        <div>
          <h1 className={styles.title}>Bienvenu(e), {user?.firstname}</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <span className={styles.roleBadge}>{user?.role}</span>
      </div>

      {isStaff() && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statAccent} />
            <span className={styles.statLabel}>Total livres</span>
            <span className={styles.statValue}>{totalBooks}</span>
            <span className={styles.statSub}>dans le catalogue</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statAccent} />
            <span className={styles.statLabel}>Disponibles</span>
            <span className={styles.statValue}>{availableBooks}</span>
            <span className={styles.statSub}>exemplaires libres</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statAccent} />
            <span className={styles.statLabel}>Emprunts en cours</span>
            <span className={styles.statValue}>{activeLoans}</span>
            <span className={styles.statSub}>actuellement</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statAccent} />
            <span className={styles.statLabel}>Retards</span>
            <span className={`${styles.statValue} ${overdueLoans > 0 ? styles.danger : ''}`}>
              {overdueLoans}
            </span>
            <span className={`${styles.statSub} ${overdueLoans > 0 ? styles.danger : ''}`}>
              {overdueLoans > 0 ? 'à traiter' : 'aucun retard'}
            </span>
          </div>
        </div>
      )}

      <div className={styles.mainGrid}>
        <div className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {isStaff() ? 'Emprunts récents' : 'Mes emprunts en cours'}
            </span>
            <button className={styles.seeAll} onClick={() => navigate('/emprunts')}>
              Voir tout →
            </button>
          </div>
          <div className={styles.card}>
            {recentLoans.length === 0 ? (
              <p className={styles.empty}>Aucun emprunt pour le moment.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Livre</th>
                    {isStaff() && <th>Emprunteur</th>}
                    <th>Date emprunt</th>
                    <th>Retour prévu</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.map(loan => (
                    <tr key={loan.id}>
                      <td>Livre #{loan.book_id}</td>
                      {isStaff() && <td className={styles.muted}>{loan.user_id.slice(0, 8)}...</td>}
                      <td className={styles.muted}>
                        {new Date(loan.loan_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className={styles.muted}>
                        {new Date(loan.due_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td><Badge status={loan.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Derniers livres ajoutés</span>
            <button className={styles.seeAll} onClick={() => navigate('/la-bibliotheque')}>
              Voir tout →
            </button>
          </div>
          <div className={styles.card}>
            {recentBooks.length === 0 ? (
              <p className={styles.empty}>Aucun livre pour le moment.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Disponibles</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBooks.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td className={styles.muted}>{book.author}</td>
                      <td>
                        <span className={book.available_copies === 0
                          ? styles.copiesDanger
                          : styles.copiesOk}>
                          {book.available_copies} / {book.total_copies}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.actionsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Actions rapides</span>
          </div>
          <div className={styles.card}>
            <div className={styles.actionsGrid}>
              {actions.map(action => (
                <button
                  key={action.label}
                  className={styles.actionBtn}
                  onClick={() => navigate(action.path)}
                >
                  <div className={styles.actionIcon}>
                    <action.icon size={16} />
                  </div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}