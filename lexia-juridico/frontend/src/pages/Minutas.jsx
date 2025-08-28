import { useEffect, useState } from 'react'
import { FaFileAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Minutas() {
  const [minutas, setMinutas] = useState([])
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const carregarMinutas = () => {
    api.get('/modelos')
      .then((res) => setMinutas(res.data))
      .catch(() => setErro('Erro ao carregar minutas.'))
  }

  useEffect(() => {
    carregarMinutas()
  }, [])

  const deletarMinuta = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta minuta?')) return
    try {
      await api.delete(`/modelos/${id}`)
      carregarMinutas()
    } catch (error) {
      setErro('Erro ao excluir minuta.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FaFileAlt className="text-[#0094FF]" />
          Minutas
        </h1>
      </div>

      <div className="flex justify-end mb-6">
        <a
          href="/minutas/nova"
          className="bg-[#0094FF] hover:bg-[#0077cc] text-white px-5 py-2 rounded-md text-sm font-semibold shadow transition-all"
        >
          + Nova Minuta
        </a>
      </div>

      {erro && <p className="text-red-400">{erro}</p>}

      <div className="lexia-card overflow-auto">
        <table className="lexia-table">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Tags</th>
              <th className="py-2 pr-4">Criado em</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {minutas.map((m) => (
              <tr key={m.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                <td className="py-2 pr-4">{m.nome}</td>
                <td className="py-2 pr-4">
                  {m.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-[#0094FF]/20 text-[#0094FF] text-xs font-semibold px-2 py-1 mr-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="py-2 pr-4">
                  {new Date(m.criado_em).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/minutas/${m.id}`)}
                    className="lexia-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletarMinuta(m.id)}
                    className="lexia-button bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
