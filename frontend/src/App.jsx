import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setupInterceptors } from './api/axiosInstance'

import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Books from './pages/Books/Books'
import Users from './pages/Users/Users'
import Loans from './pages/Loans/Loans'
import Categories from './pages/Categories/Categories'
import Profile from './pages/Profile/Profile'
import Stats from './pages/Stats/Stats'
import Layout from './components/Layout/Layout'


function ProtectedRoute({ children, staffOnly = false }) {
  const { user, token } = useAuth()

  if (!token || !user) {
    return <Navigate to="/authentification" replace />
  }

  if (staffOnly && user.role !== 'Personnel administratif') {
    return <Navigate to="/tableau-de-bord" replace />
  }

  return children
}

export default function App() {

  const { logout, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setupInterceptors(() => {
      logout()
      navigate('/authentification')
    })
  }, [logout, navigate])

  if (loading) return null

  return (
    <Routes>
      <Route path="/authentification" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/tableau-de-bord" replace />} />
        <Route path="tableau-de-bord" element={<Dashboard />} />
        <Route path="la-bibliotheque" element={<Books />} />
        <Route path="emprunts" element={<Loans />} />
        <Route path="profil" element={<Profile />} />

        <Route path="utilisateurs" element={
          <ProtectedRoute staffOnly>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="categories-de-livres" element={
          <ProtectedRoute staffOnly>
            <Categories />
          </ProtectedRoute>
        } />
        <Route path="statistiques" element={
          <ProtectedRoute staffOnly>
            <Stats />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/tableau-de-bord" replace />} />
    </Routes>
  )
}