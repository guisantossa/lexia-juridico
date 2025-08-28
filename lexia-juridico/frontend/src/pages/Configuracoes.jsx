import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfigUsuarios from './ConfigUsuarios'
import ConfigPerfis from './ConfigPerfis'
import ConfigPermissoes from './ConfigPermissoes'

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState('usuarios')
  const navigate = useNavigate()

  const abas = [
    { chave: 'usuarios', titulo: 'Usuários' },
    { chave: 'perfis', titulo: 'Perfis' },
    { chave: 'permissoes', titulo: 'Permissões' }
  ]

  const renderConteudo = () => {
    switch (abaAtiva) {
      case 'usuarios':
        return <ConfigUsuarios navigate={navigate} />
      case 'perfis':
        return <ConfigPerfis navigate={navigate} />
      case 'permissoes':
        return <ConfigPermissoes navigate={navigate} />
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Configurações</h1>

      <div className="flex gap-4 border-b border-neutral-700 mb-6">
        {abas.map((aba) => (
          <button
            key={aba.chave}
            onClick={() => setAbaAtiva(aba.chave)}
            className={`pb-2 text-sm font-medium transition-all ${
              abaAtiva === aba.chave
                ? 'border-b-2 border-[#0094FF] text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {aba.titulo}
          </button>
        ))}
      </div>

      <div>{renderConteudo()}</div>
    </div>
  )
}
