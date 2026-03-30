import { create } from 'zustand'
import client from '../api/client'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  role: localStorage.getItem('role') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await client.post('/auth/login', { email, password })
      const { accessToken, user } = response.data.data

      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', user.role)

      set({ token: accessToken, user, role: user.role, isLoading: false })
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    set({ token: null, user: null, role: null, error: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore