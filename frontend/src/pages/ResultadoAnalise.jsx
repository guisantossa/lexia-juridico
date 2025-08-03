import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../constants'

export default function ResultadoAnalise() {
  const { id } = useParams()
  const [analise, setAnalise] = useState(null)
  const [resultados, setResultados] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get(`/analises/${id}/resultados`)
        .then((res) => {
        setAnalise(res.data.analise);
        setResultados(res.data.resultados);
        })
        .catch(() => {
        setErro("Erro ao carregar resultados.");
        });
    }, [id]);

  const handleProcessar = async (resultadoId) => {
    const token = localStorage.getItem('lexia_token')
    try {
        const res = await api.post(`/analises/${resultadoId}/executar`);

        if (!res.ok) throw new Error()

        alert('Processamento iniciado!')
        // ou refetch resultados aqui
    } catch {
        alert('Erro ao processar o resultado.')
    }
  }

  return (
    <div className="lexia-card max-w-5xl mx-auto">
      {erro && <p className="text-red-400">{erro}</p>}

      {analise && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Análise #{analise.id}</h1>
            <p className="text-sm">
              <span className="text-[#9ca3af] mr-2">Nome:</span>
              <span className="text-white font-medium">{analise.cliente.nome}</span>
            </p>
            <p className="text-sm">
              <span className="text-[#9ca3af] mr-2">CPF:</span>
              <span className="text-white font-medium">{analise.cliente.cpf}</span>
            </p>
            <p className="text-sm mt-2 text-[#9ca3af]">
              {resultados.length} PPP{resultados.length !== 1 && 's'} encontrados no arquivo{' '}
              <span className="text-white font-medium">{analise.arquivo_nome}</span>
            </p>
          </div>

          <div className="lexia-card overflow-auto">
            <table className="lexia-table">
              <thead>
                <tr className="border-b border-neutral-700">
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Data de Envio</th>
                    <th className="py-2 pr-4">Texto Extraído</th>
                    <th className="py-2">Ação</th>
                </tr>
                </thead>
                <tbody>
                {resultados.map((res) => (
                    <tr key={res.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                    <td className="py-2 pr-4">
                        <span className="lexia-badge-warning">{res.status}</span>
                    </td>

                    <td className="py-2 pr-4">
                        {new Date(res.data_envio).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="py-2 pr-4 max-w-xs truncate" title={res.texto_extraido}>
                        <a
                        href={res.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#0094FF]"
                        >
                        {res.texto_extraido?.slice(0, 30)}...
                        </a>
                    </td>

                    <td className="py-2">
                        <button
                        className="lexia-button"
                        onClick={() => handleProcessar(res.id)}
                        >
                        Processar
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>

            </table>
          </div>
        </>
      )}
    </div>
  )
}
