import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

export default function MinutaForm() {
  const { id } = useParams()
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tags, setTags] = useState('')
  const [conteudoHtml, setConteudoHtml] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
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

  return (
    <div className="lexia-card max-w-3xl mx-auto">
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
          <textarea
            value={conteudoHtml}
            onChange={(e) => setConteudoHtml(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white font-mono"
            placeholder="Ex: Prezado {{nome_cliente}}, informamos que..."
            required
          />
        </div>

        <div className="bg-neutral-800 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-white">Placeholders disponíveis</h2>
          <ul className="text-sm text-neutral-300 space-y-1">
            {PLACEHOLDERS.map((p, i) => (
              <li key={i}><code>{p}</code></li>
            ))}
          </ul>
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
  )
}
