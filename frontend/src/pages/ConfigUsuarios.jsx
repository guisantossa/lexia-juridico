import { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'



export default function ConfigUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const carregarUsuarios = () => {
    api.get('/usuarios')
      .then((res) => setUsuarios(res.data))
      .catch(() => setErro('Erro ao carregar usuários.'))
  }

  const deletarUsuario = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      carregarUsuarios()
    } catch (error) {
      setErro('Erro ao excluir usuário.')
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaUser className="text-[#0094FF]" />
          Gerenciar Usuários
        </h2>
        <a
          href="/usuarios/novo"
          className="bg-[#0094FF] hover:bg-[#0077cc] text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
        >
          + Novo Usuário
        </a>
      </div>

      {erro && <p className="text-red-400 mb-4">{erro}</p>}

      <div className="lexia-card overflow-auto">
        <table className="lexia-table">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Perfil</th>
              <th className="py-2 pr-4">Ativo</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                <td className="py-2 pr-4">{u.nome_completo}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.perfil_usuario?.perfil}</td>
                <td className="py-2 pr-4">{u.ativo ? 'Sim' : 'Não'}</td>
                <td className="py-2 flex gap-2">
                  <button onClick={() => navigate(`/usuarios/${u.id}`)} className="lexia-button">Editar</button>
                  <button
                    onClick={() => deletarUsuario(u.id)}
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
