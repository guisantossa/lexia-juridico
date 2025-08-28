// Rotas sugeridas: /processos, /processos/novo, /processos/:id

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { FaFolderOpen } from 'react-icons/fa'

export default function Processos() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = Boolean(id)

  const [processos, setProcessos] = useState([])
  const [clientesSugeridos, setClientesSugeridos] = useState([])
  const [comarcas, setComarcas] = useState([])
  const [varas, setVaras] = useState([])
  const [tribunal, setTribunal] = useState('')

  const [form, setForm] = useState({
    numero_processo: '',
    cliente_cpf: '',
    cliente_nome: '',
    cliente_id: '',
    tribunal_id: '',
    comarca_id: '',
    vara_id: '',
  })

  useEffect(() => {
    api.get('/processos').then(res => setProcessos(res.data))
    api.get('/comarcas').then(res => setComarcas(res.data))
    if (editando) {
      api.get(`/processos/${id}`).then(res => setForm(res.data))
    }
  }, [id])

  useEffect(() => {
    if (form.comarca_id) {
      api.get(`/comarcas/${form.comarca_id}`).then(res => {
        setTribunal(res.data.tribunal_id)
        setForm(prev => ({ ...prev, tribunal_id: res.data.tribunal_id }))
      })
      api.get(`/varas/por-comarca/${form.comarca_id}`).then(res => setVaras(res.data))
    }
  }, [form.comarca_id])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const cpf = form.cliente_cpf?.replace(/[^0-9]/g, "")
      if (cpf?.length >= 5) {
        try {
          const res = await api.get(`/clientes/?cpf=${cpf}`)
          if (res.data) {
            setForm(prev => ({
              ...prev,
              cliente_id: res.data.id,
              cliente_nome: res.data.nome
            }))
          }
        } catch {
          setForm(prev => ({ ...prev, cliente_id: '', cliente_nome: '' }))
        }
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [form.cliente_cpf])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (form.cliente_nome.length >= 2) {
        try {
          const res = await api.get(`/clientes/?nome=${form.cliente_nome}`)
          setClientesSugeridos(res.data)
        } catch {
          setClientesSugeridos([])
        }
      } else {
        setClientesSugeridos([])
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [form.cliente_nome])

  const selecionarCliente = (cliente) => {
    setForm(prev => ({
      ...prev,
      cliente_nome: cliente.nome,
      cliente_cpf: cliente.cpf,
      cliente_id: cliente.id
    }))
    setClientesSugeridos([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (editando) await api.put(`/processos/${id}`, payload)
    else await api.post('/processos', payload)
    navigate('/processos')
  }

  if (editando || location.pathname.includes('/novo')) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">{editando ? 'Editar Processo' : 'Novo Processo'}</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 relative">

          <div className="col-span-2">
            <label className="block text-sm mb-1">Número do Processo</label>
            <input
              type="text"
              value={form.numero_processo}
              onChange={(e) => setForm({ ...form, numero_processo: e.target.value })}
              required
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">CPF do Cliente</label>
            <input
              type="text"
              value={form.cliente_cpf}
              readOnly
              onChange={(e) => setForm({ ...form, cliente_cpf: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            />
          </div>

          <div className="relative">
            <label className="block text-sm mb-1">Nome do Cliente</label>
            <input
              type="text"
              value={form.cliente_nome}
              onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            />
            {clientesSugeridos.length > 0 && (
              <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded mt-1 max-h-40 overflow-y-auto">
                {clientesSugeridos.map(c => (
                  <li
                    key={c.id}
                    className="px-3 py-2 hover:bg-neutral-700 cursor-pointer"
                    onClick={() => selecionarCliente(c)}
                  >
                    {c.nome} — {c.cpf}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Comarca</label>
            <select
              value={form.comarca_id}
              onChange={(e) => setForm({ ...form, comarca_id: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            >
              <option value="">Selecione...</option>
              {comarcas.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Vara</label>
            <select
              value={form.vara_id}
              onChange={(e) => setForm({ ...form, vara_id: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            >
              <option value="">Selecione...</option>
              {varas.map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <button type="submit" className="lexia-button w-full">
              {editando ? 'Salvar alterações' : 'Criar processo'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FaFolderOpen className="text-[#0094FF]" />
          Processos
        </h1>
        <a href="/processos/novo" className="lexia-button">+ Novo Processo</a>
      </div>

      <div className="lexia-card overflow-auto">
        <table className="lexia-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Tribunal</th>
              <th>Comarca</th>
              <th>Vara</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {processos.map((p) => (
              <tr key={p.id}>
                <td>{p.numero_processo}</td>
                <td>{p.cliente_nome}</td>
                <td>{p.tribunal_sigla}</td>
                <td>{p.comarca_nome}</td>
                <td>{p.vara_nome}</td>
                <td>
                  <button onClick={() => navigate(`/processos/${p.id}`)} className="lexia-button">
                    Editar
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
