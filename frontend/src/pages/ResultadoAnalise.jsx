import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from "../services/api"
import ReactJson from '@microlink/react-json-view'

export default function ResultadoAnalise() {
  const { id } = useParams()
  const [analise, setAnalise] = useState(null)
  const [jsonEditado, setJsonEditado] = useState(null)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)

  const [modelos, setModelos] = useState([])
  const [modeloFiltro, setModeloFiltro] = useState('')
  const [modeloSelecionado, setModeloSelecionado] = useState(null)

  const [livros, setLivros] = useState([])
  const [livrosFiltro, setLivrosFiltro] = useState('')
  const [livrosSelecionados, setLivrosSelecionados] = useState([])

  const handleSalvar = async () => {
    try {
      await api.post(`/analises/${analise.id}/salvar-json`, jsonEditado)
      alert('JSON salvo com sucesso!')
    } catch (err) {
      alert('Erro ao salvar JSON')
    }
  }

  const handleGerarMinuta = async () => {
    try {
      await api.post(`/minutas/gerar`, {
        analise_id: analise.id,
        modelo_id: modeloSelecionado,
        livros_ids: livrosSelecionados,
        dados: jsonEditado
      })
      alert('Minuta gerada com sucesso!')
      setModalAberto(false)
    } catch (err) {
      alert('Erro ao gerar minuta')
    }
  }

  const toggleLivro = (id) => {
    if (livrosSelecionados.includes(id)) {
      setLivrosSelecionados(livrosSelecionados.filter(l => l !== id))
    } else {
      setLivrosSelecionados([...livrosSelecionados, id])
    }
  }

  useEffect(() => {
    api.get(`/analises/${id}`)
      .then((res) => {
        setAnalise(res.data.analise)
        setJsonEditado(res.data.analise.json_extraido)
      })
      .catch(() => {
        setErro("Erro ao carregar a análise.")
      })

    api.get(`/modelos`)
      .then((res) => {
        setModelos(res.data)
      })

    api.get(`/livros`)
      .then((res) => {
        setLivros(res.data)
      })
  }, [id])

  const modelosFiltrados = modelos.filter((m) =>
    m.nome.toLowerCase().includes(modeloFiltro.toLowerCase()) ||
    (m.tags || []).some(tag => tag.toLowerCase().includes(modeloFiltro.toLowerCase()))
  )

  const livrosFiltrados = livros.filter((l) =>
    l.nome.toLowerCase().includes(livrosFiltro.toLowerCase()) ||
    (l.tags || []).some(tag => tag.toLowerCase().includes(livrosFiltro.toLowerCase()))
  )

  return (
    <div className="lexia-card max-w-4xl mx-auto">
      {erro && <p className="text-red-400">{erro}</p>}

      {analise && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold mb-4">Análise #{analise.id}</h1>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-neutral-400">Cliente</label>
              <div className="text-white font-medium">{analise.cliente.nome}</div>
            </div>
            <div>
              <label className="text-neutral-400">CPF</label>
              <div className="text-white font-medium">{analise.cliente.cpf}</div>
            </div>
            <div>
              <label className="text-neutral-400">Tipo de Análise</label>
              <div className="text-white font-medium">{analise.tipo}</div>
            </div>
            <div>
              <label className="text-neutral-400">Processo</label>
              <div className="text-white font-medium">{analise.processo?.numero || '-'}</div>
            </div>
            <div>
              <label className="text-neutral-400">Data de Envio</label>
              <div className="text-white font-medium">{analise.data_envio}</div>
            </div>
            <div>
              <label className="text-neutral-400">Status</label>
              <div className="lexia-badge-processing">{analise.status}</div>
            </div>
            <div className="col-span-2">
              <label className="text-neutral-400">Arquivo</label>
              <div className="text-white font-medium">{analise.arquivo_nome}</div>
            </div>

            {analise.json_extraido && (
              <div className="lexia-card mt-8 col-span-2">
                <div className="text-yellow-300 text-sm mb-4">
                  Revise os dados extraídos antes de gerar a minuta.
                </div>
                <ReactJson
                  src={analise.json_extraido}
                  theme="monokai"
                  name={false}
                  enableClipboard={false}
                  displayDataTypes={false}
                  onEdit={(e) => setJsonEditado(e.updated_src)}
                  onAdd={(e) => setJsonEditado(e.updated_src)}
                  onDelete={(e) => setJsonEditado(e.updated_src)}
                />
              </div>
            )}

            <div className="col-span-2 flex gap-4 mt-4">
              <button className="lexia-button" onClick={handleSalvar}>
                Salvar Alterações
              </button>
              <button className="lexia-button bg-blue-600" onClick={() => setModalAberto(true)}>
                Gerar Minuta
              </button>
            </div>

            {analise.pdf_url && (
              <div className="col-span-2 mt-4">
                <a
                  href={analise.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0094FF] underline"
                >
                  Baixar Laudo PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-neutral-900 p-6 rounded-lg shadow-xl w-full max-w-xl text-white">
            <h2 className="text-xl font-semibold mb-4">Selecionar Modelo e Referências</h2>

            <div className="mb-4">
              <label className="text-neutral-300 mb-1 block">Buscar Modelo</label>
              <input
                type="text"
                className="lexia-input w-full mb-2"
                value={modeloFiltro}
                onChange={(e) => setModeloFiltro(e.target.value)}
                placeholder="Filtrar por nome ou tag..."
              />
              <select
                className="lexia-input text-black bg-white w-full"
                onChange={(e) => setModeloSelecionado(e.target.value)}
                value={modeloSelecionado || ''}
              >
                <option value="">Selecione um modelo</option>
                {modelosFiltrados.map((m) => (
                  <option key={m.id} value={m.id} className="lexia-input text-black bg-white w-full">
                    {m.nome} {m.tags?.length ? `(${m.tags.join(', ')})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-neutral-300 mb-1 block">Buscar Livros</label>
              <input
                type="text"
                className="lexia-input w-full mb-2"
                value={livrosFiltro}
                onChange={(e) => setLivrosFiltro(e.target.value)}
                placeholder="Filtrar por nome ou tag..."
              />
              <div className="max-h-48 overflow-y-auto border border-neutral-700 rounded p-2">
                {livrosFiltrados.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={livrosSelecionados.includes(l.id)}
                      onChange={() => toggleLivro(l.id)}
                    />
                    <span>
                      {l.nome}
                      {l.tags?.length > 0 && (
                        <span className="ml-2 text-xs text-neutral-400">({l.tags.join(', ')})</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="lexia-button" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button
                className="lexia-button bg-green-600"
                onClick={handleGerarMinuta}
                disabled={!modeloSelecionado || livrosSelecionados.length === 0}
              >
                Gerar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
