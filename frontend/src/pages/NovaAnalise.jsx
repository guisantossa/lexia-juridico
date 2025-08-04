import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../services/api";

export default function NovaAnalise() {
  const [tipos, setTipos] = useState([])
  const [tipoId, setTipoId] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const token = localStorage.getItem('lexia_token')
  const navigate = useNavigate()
  
  useEffect(() => {
    api.get("/tipos-analise")
      .then((res) => {
        setTipos(res.data);
        if (res.data.length > 0) setTipoId(res.data[0].id);
      })
      .catch(() => {
        setMensagem("Erro ao carregar tipos de análise.");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!arquivo || arquivo.type !== 'application/pdf') {
      setMensagem('Envie um arquivo PDF válido.')
      return
    }

    setCarregando(true)
    setMensagem('')

    const formData = new FormData()
    formData.append('tipo_id', parseInt(tipoId))
    formData.append('nome', nome)
    formData.append('cpf', cpf)
    formData.append('file', arquivo)
    console.log("Token enviado:", token);
    console.log("Headers:", {
      Authorization: `Bearer ${token}`
    });
    const response = await api.post("/analises/nova", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      setMensagem('Erro de comunicação com o servidor.')
      return
    } 
    
    if (response.ok) {
      navigate(`/analises/${data.id}/resultados`)
    } else {
      setMensagem(data.detail || 'Erro ao enviar.')
    }

    
  }

  return (
    <div className="lexia-card max-w-xl mx-auto">
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
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Nome do Trabalhador</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">CPF do Trabalhador</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white"
            required
          />
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
  )
}
