import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function LivroNovo() {
  const [nome, setNome] = useState('')
  const [file, setFile] = useState(null)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nome || !file) {
      setErro('Preencha o nome e selecione um PDF.')
      return
    }

    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('file', file)

    try {
      await api.post('/livros/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/referencias')
    } catch {
      setErro('Erro ao fazer upload.')
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Adicionar Livro</h1>

      <form onSubmit={handleSubmit} className="lexia-card p-6 space-y-4">
        {erro && <p className="text-red-400">{erro}</p>}

        <div>
          <label className="block mb-1 text-sm font-medium">Nome do Livro</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="lexia-input"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Arquivo PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="lexia-input"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0094FF] hover:bg-[#0077cc] text-white px-5 py-2 rounded-md text-sm font-semibold shadow"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
