import axios from 'axios'
import useAuthStore from '../store/useAuthStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 — clear only auth state, then redirect cleanly
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Use the store's logout so only auth keys are removed
      // (theme, filters, and other localStorage entries are preserved)
      useAuthStore.getState().logout()
      // replace() avoids leaving the protected page in browser history
      window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)

export default client