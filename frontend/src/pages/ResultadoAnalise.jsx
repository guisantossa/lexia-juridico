// src/pages/ResultadoAnalise.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from "../services/api"
import ReactJson from '@microlink/react-json-view'

export default function ResultadoAnalise() {
  const { id } = useParams()
  const [analise, setAnalise] = useState(null)
  const [jsonEditado, setJsonEditado] = useState(null)
  const [erro, setErro] = useState('')

  const handleSalvar = async () => {
    try {
      await api.post(`/analises/${analise.id}/salvar-json`, jsonEditado)
      alert('JSON salvo com sucesso!')
    } catch (err) {
      alert('Erro ao salvar JSON')
    }
  }

  useEffect(() => {
    api.get(`/analises/${id}`)
      .then((res) => {
        const a = res.data.analise
        setAnalise(a)
        try {
          const parsed = typeof a.json_extraido === 'string'
            ? JSON.parse(a.json_extraido)
            : a.json_extraido
          setJsonEditado(parsed)
        } catch {
          setJsonEditado(a.json_extraido)
        }
      })
      .catch(() => {
        setErro("Erro ao carregar a análise.")
      })
  }, [id])

  return (
    <div className="lexia-card max-w-4xl mx-auto">
      {erro && <p className="text-red-400">{erro}</p>}

      {analise && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold mb-4">Análise #{analise.id}</h1>

          <div className="grid grid-cols-2 gap-4 text-sm">
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

            {jsonEditado && (
              <div className="lexia-card mt-8 col-span-2">
                <div className="text-yellow-300 text-sm mb-4">
                  Revise os dados extraídos antes de gerar a minuta.
                </div>
                <ReactJson
                  src={jsonEditado}
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
    </div>
  )
}
