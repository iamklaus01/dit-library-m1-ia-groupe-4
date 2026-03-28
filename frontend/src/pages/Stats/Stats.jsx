import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getBooks, getCategories } from '../../api/books'
import { getLoans } from '../../api/loans'
import { getUsers } from '../../api/users'
import styles from './Stats.module.css'

export default function Stats() {
  const { token } = useAuth()

  const [books, setBooks] = useState([])
  const [loans, setLoans] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getBooks(token),
      getLoans(token),
      getUsers(token),
      getCategories(token)
    ]).then(([b, l, u, c]) => {
      setBooks(b)
      setLoans(l)
      setUsers(u)
      setCategories(c)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const totalBooks = books.length
  const totalCopies = books.reduce((sum, b) => sum + b.total_copies, 0)
  const availableCopies = books.reduce((sum, b) => sum + b.available_copies, 0)
  const borrowedCopies = totalCopies - availableCopies

  const totalLoans = loans.length
  const activeLoans = loans.filter(l => l.status === 'EN_COURS').length
  const overdueLoans = loans.filter(l => l.status === 'EN_RETARD').length
  const returnedLoans = loans.filter(l => l.status === 'RETOURNE').length

  const totalUsers = users.length
  const students = users.filter(u => u.role === 'Etudiant').length
  const professors = users.filter(u => u.role === 'Professeur').length
  const staff = users.filter(u => u.role === 'Personnel administratif').length

  const booksByCategory = categories.map(cat => ({
    name: cat.name,
    count: books.filter(b => b.category?.name === cat.name).length
  })).filter(c => c.count > 0)

  const maxCategoryCount = Math.max(...booksByCategory.map(c => c.count), 1)

  if (loading) return <div className={styles.loading}>Chargement...</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Statistiques</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total livres</span>
          <span className={styles.statValue}>{totalBooks}</span>
          <span className={styles.statSub}>{totalCopies} exemplaires au total</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Exemplaires disponibles</span>
          <span className={styles.statValue}>{availableCopies}</span>
          <span className={styles.statSub}>{borrowedCopies} en cours d'emprunt</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total emprunts</span>
          <span className={styles.statValue}>{totalLoans}</span>
          <span className={styles.statSub}>{returnedLoans} retournés</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Utilisateurs</span>
          <span className={styles.statValue}>{totalUsers}</span>
          <span className={styles.statSub}>{students} étudiants · {professors} profs</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Emprunts par statut</h2>
          <div className={styles.donutWrap}>
            <div className={styles.donutBars}>
              <div className={styles.barRow}>
                <span className={styles.barLabel}>En cours</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.bar} ${styles.barWarning}`}
                    style={{ width: totalLoans ? `${(activeLoans / totalLoans) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.barValue}>{activeLoans}</span>
              </div>
              <div className={styles.barRow}>
                <span className={styles.barLabel}>En retard</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.bar} ${styles.barDanger}`}
                    style={{ width: totalLoans ? `${(overdueLoans / totalLoans) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.barValue}>{overdueLoans}</span>
              </div>
              <div className={styles.barRow}>
                <span className={styles.barLabel}>Retournés</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.bar} ${styles.barSuccess}`}
                    style={{ width: totalLoans ? `${(returnedLoans / totalLoans) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.barValue}>{returnedLoans}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Utilisateurs par rôle</h2>
          <div className={styles.donutBars}>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>Étudiants</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.bar} ${styles.barPrimary}`}
                  style={{ width: totalUsers ? `${(students / totalUsers) * 100}%` : '0%' }}
                />
              </div>
              <span className={styles.barValue}>{students}</span>
            </div>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>Professeurs</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.bar} ${styles.barBlue}`}
                  style={{ width: totalUsers ? `${(professors / totalUsers) * 100}%` : '0%' }}
                />
              </div>
              <span className={styles.barValue}>{professors}</span>
            </div>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>Personnel</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.bar} ${styles.barWarning}`}
                  style={{ width: totalUsers ? `${(staff / totalUsers) * 100}%` : '0%' }}
                />
              </div>
              <span className={styles.barValue}>{staff}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Livres par catégorie</h2>
          {booksByCategory.length === 0 ? (
            <p className={styles.empty}>Aucune donnée disponible.</p>
          ) : (
            <div className={styles.donutBars}>
              {booksByCategory.map(cat => (
                <div key={cat.name} className={styles.barRow}>
                  <span className={styles.barLabel}>{cat.name}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.bar} ${styles.barPrimary}`}
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>{cat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}