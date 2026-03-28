import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BOOKS_SERVICE_URL || 'http://localhost:8001'
})

const authHeader = (token) => ({ Authorization: `Bearer ${token}` })

export const getBooks = (token) =>
  api.get('/books/', { headers: authHeader(token) }).then(r => r.data)

export const getBook = (token, id) =>
  api.get(`/books/${id}`, { headers: authHeader(token) }).then(r => r.data)

export const searchBooks = (token, params) =>
  api.get('/books/search/', { headers: authHeader(token), params }).then(r => r.data)

export const createBook = (token, data) =>
  api.post('/books/', data, { headers: authHeader(token) }).then(r => r.data)

export const updateBook = (token, id, data) =>
  api.put(`/books/${id}`, data, { headers: authHeader(token) }).then(r => r.data)

export const deleteBook = (token, id) =>
  api.delete(`/books/${id}`, { headers: authHeader(token) }).then(r => r.data)

export const getCategories = (token) =>
  api.get('/categories/', { headers: authHeader(token) }).then(r => r.data)

export const createCategory = (token, data) =>
  api.post('/categories/', data, { headers: authHeader(token) }).then(r => r.data)

export const deleteCategory = (token, id) =>
  api.delete(`/categories/${id}`, { headers: authHeader(token) }).then(r => r.data)