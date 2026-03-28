import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_LOANS_SERVICE_URL || 'http://localhost:8003'
})

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

export const getLoans = (token) =>
  api.get('/loans/', { headers: authHeader(token) }).then(r => r.data)

export const getMyLoans = (token) =>
  api.get('/loans/me', { headers: authHeader(token) }).then(r => r.data)

export const createLoan = (token, data) =>
  api.post('/loans/', data, { headers: authHeader(token) }).then(r => r.data)

export const returnLoan = (token, id) =>
  api.put(`/loans/${id}/return`, {}, { headers: authHeader(token) }).then(r => r.data)

export const checkOverdue = (token) =>
  api.post('/loans/check-overdue', {}, { headers: authHeader(token) }).then(r => r.data)