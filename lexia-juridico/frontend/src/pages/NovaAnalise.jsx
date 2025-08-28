import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../services/api"

export default function NovaAnalise() {
  const [tipos, setTipos] = useState([])
  const [clientes, setClientes] = useState([])
  const [processos, setProcessos] = useState([])

  const [tipoId, setTipoId] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [processoNumero, setProcessoNumero] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    api.get("/tipos-analise").then((res) => {
      setTipos(res.data)
      if (res.data.length > 0) setTipoId(res.data[0].id)
    })

    api.get("/clientes").then((res) => setClientes(res.data))
    api.get("/processos").then((res) => setProcessos(res.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!clienteId) return setMensagem("Selecione um cliente válido.")
    if (!arquivo || arquivo.type !== 'application/pdf') {
      return setMensagem('Envie um arquivo PDF válido.')
    }

    setCarregando(true)
    setMensagem('')

    const formData = new FormData()
    formData.append('tipo_id', parseInt(tipoId))
    formData.append('cliente_id', clienteId)
    if (processoId) formData.append('processo_id', processoId)
    formData.append('file', arquivo)

    try {
      const response = await api.post("/analises/nova", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      navigate(`/analises/${response.data.id}/resultados`)
    } catch (err) {
      setMensagem(err.response?.data?.detail || 'Erro ao enviar.')
    } finally {
      setCarregando(false)
    }
  }

  const handleClienteSelect = (nome) => {
    const cliente = clientes.find((c) => c.nome === nome)
    setClienteNome(nome)
    setClienteId(cliente?.id || '')
  }

  const handleProcessoSelect = (numero) => {
    const processo = processos.find((p) => p.numero === numero)
    setProcessoNumero(numero)
    setProcessoId(processo?.id || '')
  }

  return (
    <div className="min-h-screen flex items-start justify-center pt-28 px-4">
      <div className="lexia-card max-w-xl w-full">
        <h1 className="text-2xl font-semibold mb-6">Nova Análise</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">Tipo de Análise</label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
              required
            >
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm mb-1">Cliente</label>
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => {
                setClienteNome(e.target.value)
                setClienteId('')
              }}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
              placeholder="Digite para buscar..."
              autoComplete="off"
              required
            />
            {clienteNome && !clienteId && (
              <ul className="absolute z-10 bg-neutral-800 w-full max-h-40 overflow-y-auto border border-neutral-700 mt-1 rounded-md text-sm">
                {clientes
                  .filter((c) =>
                    c.nome.toLowerCase().includes(clienteNome.toLowerCase())
                  )
                  .map((c) => (
                    <li
                      key={c.id}
                      onClick={() => handleClienteSelect(c.nome)}
                      className="px-3 py-2 hover:bg-neutral-700 cursor-pointer"
                    >
                      {c.nome}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm mb-1">Processo (opcional)</label>
            <input
              type="text"
              value={processoNumero}
              onChange={(e) => {
                setProcessoNumero(e.target.value)
                setProcessoId('')
              }}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
              placeholder="Digite para buscar..."
              autoComplete="off"
            />
            {processoNumero && !processoId && (
              <ul className="absolute z-10 bg-neutral-800 w-full max-h-40 overflow-y-auto border border-neutral-700 mt-1 rounded-md text-sm">
                {processos
                  .filter((p) =>
                    p.numero.toLowerCase().includes(processoNumero.toLowerCase())
                  )
                  .map((p) => (
                    <li
                      key={p.id}
                      onClick={() => handleProcessoSelect(p.numero)}
                      className="px-3 py-2 hover:bg-neutral-700 cursor-pointer"
                    >
                      {p.numero}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Arquivo (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setArquivo(e.target.files[0])}
              className="text-sm text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="lexia-button disabled:opacity-50"
            disabled={carregando}
          >
            {carregando ? 'Enviando...' : 'Enviar'}
          </button>

          {mensagem && <p className="text-sm mt-2 text-yellow-400">{mensagem}</p>}
        </form>
      </div>
    </div>
  )
}
