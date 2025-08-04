import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function LivroNovo() {
  const [nome, setNome] = useState('')
  const [file, setFile] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem('')

    if (!nome || !file) {
      setMensagem('Preencha o nome e selecione um PDF.')
      return
    }

    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('file', file)

    setCarregando(true)
    try {
      await api.post('/livros/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/referencias')
    } catch {
      setMensagem('Erro ao fazer upload.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="lexia-card max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Adicionar Livro</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1">Nome do Livro</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Arquivo PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
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
  )
}
