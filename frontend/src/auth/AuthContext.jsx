// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('lexia_token')
    if (storedToken) {
      setToken(storedToken)
    }
    setCarregando(false)
  }, [])

  const login = (t) => {
    localStorage.setItem('lexia_token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('lexia_token')
    setToken(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
