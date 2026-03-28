import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ArrowLeftRight,
  User, Users, Tag, BarChart2, LogOut
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Sidebar.module.css'

const navItems = [
  { label: 'Accueil', path: '/tableau-de-bord', icon: LayoutDashboard },
  { label: 'La bibliothèque', path: '/la-bibliotheque', icon: BookOpen },
  { label: 'Mon profil', path: '/profil', icon: User },
]

const userItems = [
  { label: 'Mes emprunts', path: '/emprunts', icon: ArrowLeftRight },
]

const staffItems = [
    { label: 'Gestion des emprunts', path: '/emprunts', icon: ArrowLeftRight },
    { label: 'Statistiques', path: '/statistiques', icon: BarChart2 },
    { label: 'Catégories de livres', path: '/categories-de-livres', icon: Tag },
    { label: 'Gestion utilisateurs', path: '/utilisateurs', icon: Users },
]

export default function Sidebar() {
  const { user, isStaff, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/authentification')
  }

  const getInitials = (user) => {
    if (!user) return 'U'
    return `${user.firstname?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoTitle}>Librairie DIT</span>
        <span className={styles.logoSub}>Bibliothèque numérique</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
            <span className={styles.sectionLabel}>Principal</span>
            {navItems.map(item => (
                <NavLink key={item.path} to={item.path}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <item.icon size={16} />
                {item.label}
                </NavLink>
            ))}
            {!isStaff() && userItems.map(item => (
                <NavLink key={item.path} to={item.path}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <item.icon size={16} />
                {item.label}
                </NavLink>
            ))}
        </div>

        {isStaff() && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Administration</span>
            {staffItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className={styles.footer}>
        <div className={styles.avatar}>
          {getInitials(user)}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.firstname} {user?.surname}
          </span>
          <span className={styles.userRole}>{user?.role}</span>
        </div>
        <button title='Se déconnecter' className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}