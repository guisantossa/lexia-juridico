import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import Quill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { FaChevronRight } from 'react-icons/fa'
import api from '../services/api'

const PLACEHOLDERS = [
  '{{nome_cliente}}',
  '{{cpf}}',
  '{{funcao}}',
  '{{setor}}',
  '{{vinculo_inicio}}',
  '{{vinculo_fim}}',
  '{{agentes}}',
  '{{conclusao_medico}}',
  '{{conclusao_engenheiro}}'
]

// REGISTRA FONTES PERMITIDAS
const Font = Quill.Quill.import('formats/font')
Font.whitelist = ['arial', 'times-new-roman', 'courier', 'roboto']
Quill.Quill.register(Font, true)

export default function MinutaForm() {
  const { id } = useParams()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tags, setTags] = useState('')
  const [conteudoHtml, setConteudoHtml] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [showPlaceholders, setShowPlaceholders] = useState(true)
  const navigate = useNavigate()
  const editando = Boolean(id)

  useEffect(() => {
    if (editando) {
      api.get(`/modelos/${id}`)
        .then((res) => {
          const m = res.data
          setNome(m.nome)
          setDescricao(m.descricao || '')
          setTags((m.tags || []).join(', '))
          setConteudoHtml(m.conteudo_html)
        })
        .catch(() => setMensagem('Erro ao carregar minuta.'))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensagem('')

    if (!nome || !conteudoHtml) {
      setMensagem('Preencha o nome e o conteúdo da minuta.')
      return
    }

    const payload = {
      nome,
      descricao,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      conteudo_html: conteudoHtml
    }

    setCarregando(true)
    try {
      if (editando) {
        await api.put(`/modelos/${id}`, payload)
      } else {
        await api.post('/modelos', payload)
      }
      navigate('/minutas')
    } catch {
      setMensagem('Erro ao salvar minuta.')
    } finally {
      setCarregando(false)
    }
  }

  const inserirNoCursor = (texto) => {
    const editor = document.querySelector('.ql-editor')
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const span = document.createTextNode(texto)
    range.deleteContents()
    range.insertNode(span)
    range.setStartAfter(span)
    range.setEndAfter(span)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* Coluna principal */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="lexia-card max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">
            {editando ? 'Editar Minuta' : 'Nova Minuta'}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1">Nome da Minuta</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Descrição</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Conteúdo da Minuta</label>
              <ReactQuill
                theme="snow"
                value={conteudoHtml}
                onChange={setConteudoHtml}
                className="min-h-[500px] w-full bg-white text-black rounded-md"
                placeholder="Ex: Prezado {{nome_cliente}}, informamos que..."
                modules={{
                  toolbar: [
                    [{ font: [] }],
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
                formats={[
                  'font', 'header', 'bold', 'italic', 'underline',
                  'list', 'bullet', 'link'
                ]}
              />
            </div>

            <button
              type="submit"
              className="lexia-button disabled:opacity-50"
              disabled={carregando}
            >
              {carregando ? 'Salvando...' : 'Salvar'}
            </button>

            {mensagem && <p className="text-sm mt-2 text-yellow-400">{mensagem}</p>}
          </form>
        </div>
      </div>

      {/* Coluna de Placeholders */}
      <div className={`w-72 bg-neutral-800 p-4 transition-all duration-300 ${showPlaceholders ? '' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Placeholders</h2>
          <button
            type="button"
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="text-white transform transition-transform duration-300"
          >
            <FaChevronRight className={`transition-transform ${showPlaceholders ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showPlaceholders && (
          <ul className="text-sm text-neutral-300 space-y-1">
            {PLACEHOLDERS.map((p, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => inserirNoCursor(p)}
                  className="text-blue-300 hover:underline"
                >
                  <code>{p}</code>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
