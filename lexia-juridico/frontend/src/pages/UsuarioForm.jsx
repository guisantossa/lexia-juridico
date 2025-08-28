import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { InputMask } from '@react-input/mask';

export default function UsuarioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [perfilId, setPerfilId] = useState('')
  const [perfis, setPerfis] = useState([])
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    api.get('/perfis').then((res) => setPerfis(res.data))

    if (editando) {
      api.get(`/usuarios/${id}`).then((res) => {
        const u = res.data
        setNome(u.nome_completo)
        setEmail(u.email)
        setTelefone(u.telefone || '')
        setPerfilId(u.perfil_usuario?.id || '')
        setCep(u.cep || '')
        setEndereco(u.endereco || '')
        setBairro(u.bairro || '')
        setCidade(u.cidade || '')
        setEstado(u.estado || '')
      })
    }
  }, [id])

  const buscarCep = async () => {
    if (!cep || cep.length < 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setEndereco(data.logradouro || '')
        setBairro(data.bairro || '')
        setCidade(data.localidade || '')
        setEstado(data.uf || '')
      }
    } catch {
      console.warn('Erro ao buscar CEP')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem('')

    if (!nome || !email || !perfilId || (!editando && !senha)) {
      setMensagem('Preencha todos os campos obrigatórios.')
      return
    }

    const payload = {
      nome_completo: nome,
      email,
      telefone,
      perfil_usuario_id: parseInt(perfilId),
      cep,
      endereco,
      bairro,
      cidade,
      estado,
    }
    if (!editando) payload.senha = senha

    try {
      if (editando) {
        await api.put(`/usuarios/${id}`, payload)
      } else {
        await api.post('/usuarios', payload)
      }
      navigate('/configuracoes')
    } catch (err) {
      setMensagem('Erro ao salvar usuário.')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {editando ? 'Editar Usuário' : 'Novo Usuário'}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Nome completo *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        {!editando && (
          <div>
            <label className="block text-sm mb-1">Senha *</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Telefone</label>
          <InputMask
            mask="(__) _____-____"
            replacement={{ _: /\d/ }}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Perfil *</label>
          <select
            value={perfilId}
            onChange={(e) => setPerfilId(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          >
            <option value="">Selecione...</option>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>{p.perfil}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">CEP</label>
          <InputMask
            mask="_____-___"
              replacement={{ _: /\d/ }}
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={buscarCep}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Endereço</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Bairro</label>
          <input
            type="text"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Cidade</label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Estado</label>
          <input
            type="text"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div className="col-span-2">
          <button type="submit" className="lexia-button w-full">
            {editando ? 'Salvar alterações' : 'Criar usuário'}
          </button>
          {mensagem && <p className="text-yellow-400 text-sm mt-2">{mensagem}</p>}
        </div>
      </form>
    </div>
  )
}
