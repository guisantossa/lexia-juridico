import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function PermissaoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (editando) {
      api.get(`/permissoes/${id}`)
        .then((res) => setNome(res.data.nome_permissao))
        .catch(() => setMensagem('Erro ao carregar permissão.'))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem('')

    if (!nome) {
      setMensagem('O nome da permissão é obrigatório.')
      return
    }

    const payload = { nome_permissao: nome }

    try {
      if (editando) {
        await api.put(`/permissoes/${id}`, payload)
      } else {
        await api.post('/permissoes', payload)
      }
      navigate('/configuracoes')
    } catch {
      setMensagem('Erro ao salvar permissão.')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {editando ? 'Editar Permissão' : 'Nova Permissão'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1">Nome da Permissão</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <button type="submit" className="lexia-button">
          {editando ? 'Salvar alterações' : 'Criar permissão'}
        </button>

        {mensagem && <p className="text-yellow-400 text-sm mt-2">{mensagem}</p>}
      </form>
    </div>
  )
}
