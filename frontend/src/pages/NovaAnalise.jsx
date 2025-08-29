// src/pages/NovaAnalise.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function NovaAnalise() {
  const [titulo, setTitulo] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!titulo.trim()) return setMensagem('Dê um título para a análise.')
    if (!arquivo || arquivo.type !== 'application/pdf') {
      return setMensagem('Envie um arquivo PDF válido.')
    }

    setCarregando(true)
    setMensagem('')

    const formData = new FormData()
    formData.append('titulo', titulo)
    formData.append('file', arquivo)

    try {
      const response = await api.post('/analises/nova', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/analises/${response.data.id}/resultados`)
    } catch (err) {
      setMensagem(err.response?.data?.detail || 'Erro ao enviar.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center pt-28 px-4">
      <div className="lexia-card max-w-xl w-full">
        <h1 className="text-2xl font-semibold mb-6">Nova Análise</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Título da Análise</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
              placeholder="Digite um nome para a análise"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Arquivo (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              className="text-sm text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="lexia-button disabled:opacity-50"
            disabled={carregando}
          >
            {carregando ? 'Enviando...' : 'Enviar'}
          </button>

          {mensagem && <p className="text-sm mt-2 text-yellow-400">{mensagem}</p>}
        </form>
      </div>
    </div>
  )
}
