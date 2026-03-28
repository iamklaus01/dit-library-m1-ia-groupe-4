import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_USERS_SERVICE_URL || 'http://localhost:8002'
})

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

export const loginUser = async (email, password) => {
  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)
  const response = await api.post('/users/login', formData)
  return response.data
}

export const getMe = (token) =>
  api.get('/users/me', { headers: authHeader(token) }).then(r => r.data)

export const getUsers = (token) =>
  api.get('/users/', { headers: authHeader(token) }).then(r => r.data)

export const createUser = (token, data) =>
  api.post('/users/', data, { headers: authHeader(token) }).then(r => r.data)

export const deleteUser = (token, id) =>
  api.delete(`/users/${id}`, { headers: authHeader(token) }).then(r => r.data)

export const resetPassword = (token, id) =>
  api.put(`/users/${id}/reset-password`, {}, { headers: authHeader(token) }).then(r => r.data)

export const updateMe = (token, data) =>
  api.put('/users/me', data, { headers: authHeader(token) }).then(r => r.data)

export const updateMyPassword = (token, data) =>
  api.put('/users/me/password', data, { headers: authHeader(token) }).then(r => r.data)

export const updateUserRole = (token, id, role) =>
  api.put(`/users/${id}/role`, { role }, { headers: authHeader(token) }).then(r => r.data)