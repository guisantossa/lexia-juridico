import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function PerfilForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [perfil, setPerfil] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (editando) {
      api.get(`/perfis/${id}`)
        .then((res) => setPerfil(res.data.perfil))
        .catch(() => setMensagem('Erro ao carregar perfil.'))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem('')

    if (!perfil) {
      setMensagem('O nome do perfil é obrigatório.')
      return
    }

    try {
      if (editando) {
        await api.put(`/perfis/${id}`, { perfil })
      } else {
        await api.post('/perfis', { perfil })
      }
      navigate('/configuracoes')
    } catch {
      setMensagem('Erro ao salvar perfil.')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {editando ? 'Editar Perfil' : 'Novo Perfil'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1">Nome do Perfil</label>
          <input
            type="text"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <button type="submit" className="lexia-button">
          {editando ? 'Salvar alterações' : 'Criar perfil'}
        </button>

        {mensagem && <p className="text-yellow-400 text-sm mt-2">{mensagem}</p>}
      </form>
    </div>
  )
}
