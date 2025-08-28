import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { InputMask } from '@react-input/mask'

export default function ClienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (editando) {
      api.get(`/clientes/${id}`).then((res) => {
        const c = res.data
        setNome(c.nome)
        setCpf(c.cpf)
        setCep(c.cep || '')
        setEndereco(c.endereco || '')
        setBairro(c.bairro || '')
        setCidade(c.cidade || '')
        setEstado(c.estado || '')
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

    if (!nome || !cpf) {
      setMensagem('Preencha os campos obrigatórios.')
      return
    }

    const payload = { nome, cpf, cep, endereco, bairro, cidade, estado }

    try {
      if (editando) {
        await api.put(`/clientes/${id}`, payload)
      } else {
        await api.post('/clientes', payload)
      }
      navigate('/clientes')
    } catch (err) {
      setMensagem('Erro ao salvar cliente.')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {editando ? 'Editar Cliente' : 'Novo Cliente'}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">CPF *</label>
          <InputMask
            mask="___.___.___-__"
            replacement={{ _: /\d/ }}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
          />
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
            {editando ? 'Salvar alterações' : 'Criar cliente'}
          </button>
          {mensagem && <p className="text-yellow-400 text-sm mt-2">{mensagem}</p>}
        </div>
      </form>
    </div>
  )
}
