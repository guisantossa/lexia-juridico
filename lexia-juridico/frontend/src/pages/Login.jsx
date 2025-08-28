import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { API_URL } from '../constants'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // 🚨 Se já está logado, redireciona automaticamente
  useEffect(() => {
    if (isAuthenticated) {
      const next = searchParams.get('next') || '/'
      navigate(next, { replace: true })
    }
  }, [isAuthenticated, navigate, searchParams])

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Erro ao fazer login.')

      localStorage.setItem('lexia_token', data.access_token)
      login(data.access_token) // atualiza o AuthContext

      const next = searchParams.get('next') || '/'
      navigate(next, { replace: true })
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  // Se já está logado, não renderiza o form (só pra garantir)
  if (isAuthenticated) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
      <div className="bg-[#1a1a1a] p-8 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#0094FF] mb-6">Lexia - Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-700 text-white"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            className="lexia-button disabled:opacity-50"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
