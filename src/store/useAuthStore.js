import { create } from 'zustand'
import client from '../api/client'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  // M6: wrap JSON.parse in try-catch — malformed value in localStorage won't crash store init
  user: (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })(),
  role: localStorage.getItem('role') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await client.post('/auth/login', { email, password })

      // M8: backend always returns { success: true, data: { accessToken, user } }
      // Single branch — no more guessing at shape variants
      const token = response.data?.data?.accessToken
      const userData = response.data?.data?.user

      if (!token || !userData) {
        throw new Error('Invalid response format from login API')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('role', userData.role)

      set({ token, user: userData, role: userData.role, isLoading: false })
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
    localStorage.removeItem('auth') // legacy key cleanup
    set({ token: null, user: null, role: null, error: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore