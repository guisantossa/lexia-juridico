import { useEffect, useState } from 'react'
import { FaIdBadge } from 'react-icons/fa'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'


export default function ConfigPerfis() {
  const [perfis, setPerfis] = useState([])
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const carregarPerfis = () => {
    api.get('/perfis')
      .then((res) => setPerfis(res.data))
      .catch(() => setErro('Erro ao carregar perfis.'))
  }

  const deletarPerfil = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este perfil?')) return
    try {
      await api.delete(`/perfis/${id}`)
      carregarPerfis()
    } catch (error) {
      setErro('Erro ao excluir perfil.')
    }
  }

  useEffect(() => {
    carregarPerfis()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaIdBadge className="text-[#0094FF]" />
          Gerenciar Perfis
        </h2>
        <a
          href="/perfis/novo"
          className="bg-[#0094FF] hover:bg-[#0077cc] text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
        >
          + Novo Perfil
        </a>
      </div>

      {erro && <p className="text-red-400 mb-4">{erro}</p>}

      <div className="lexia-card overflow-auto">
        <table className="lexia-table">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Perfil</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {perfis.map((p) => (
              <tr key={p.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                <td className="py-2 pr-4">{p.id}</td>
                <td className="py-2 pr-4">{p.perfil}</td>
                <td className="py-2 flex gap-2">
                  <button onClick={() => navigate(`/perfis/${p.id}`)} className="lexia-button">Editar</button>
                  <button
                    onClick={() => deletarPerfil(p.id)}
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