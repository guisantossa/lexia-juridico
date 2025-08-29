// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Flag para pular autenticação (controlada por .env)
  const bypass = import.meta.env.VITE_BYPASS_AUTH === '1'

  useEffect(() => {
    const storedToken = localStorage.getItem('lexia_token')

    if (storedToken) {
      setToken(storedToken)
      setCarregando(false)
      return
    }

    // Se bypass estiver ligado, cria um token de teste automaticamente
    if (bypass) {
      const dummy = 'dev-bypass-token'
      localStorage.setItem('lexia_token', dummy)
      setToken(dummy)
    }

    setCarregando(false)
  }, [bypass])

  const login = (t) => {
    localStorage.setItem('lexia_token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('lexia_token')
    setToken(null)
  }

  // Se bypass estiver ligado, considera autenticado sempre
  const isAuthenticated = bypass ? true : !!token

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
