import styles from './Badge.module.css'

const config = {
  EN_COURS: { label: 'En cours', type: 'warning' },
  EN_RETARD: { label: 'En retard', type: 'danger' },
  RETOURNE: { label: 'Retourné', type: 'success' },
}

export default function Badge({ status }) {
  const { label, type } = config[status] ?? { label: status, type: 'warning' }
  return <span className={`${styles.badge} ${styles[type]}`}>{label}</span>
}