import axios from 'axios'

export function setupInterceptors(onUnauthorized) {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        onUnauthorized()
      }
      return Promise.reject(error)
    }
  )
}