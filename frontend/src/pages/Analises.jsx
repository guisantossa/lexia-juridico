import { useEffect, useState } from 'react'
import api from "../services/api"; 

export default function Analises() {
  const [analises, setAnalises] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('lexia_token')
    api.get("/analises")
    .then((res) => {
      setAnalises(res.data);
    })
    .catch(() => {
      setErro("Erro ao carregar análises.");
    });
  }, [])

  const badge = (status) => {
    switch (status) {
      case 'laudo_disponivel':
        return <span className="lexia-badge-success">Laudo disponível</span>
      case 'aguardando':
        return <span className="lexia-badge-warning">Aguardando</span>
      case 'erro':
        return <span className="lexia-badge-error">Erro</span>
      default:
        return <span className="lexia-badge-processing">Processando</span>
    }
  }
  const handleExcluir = async (id) => {
    const confirmar = confirm('Tem certeza que deseja excluir esta análise?')
    if (!confirmar) return

    const token = localStorage.getItem('lexia_token')
    try {
      const res = await api.post(`/analises/${id}/excluir`);

      if (!res.ok) throw new Error()

      setAnalises((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('Erro ao excluir a análise.')
    }
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Análises</h1>
      </div>

      <div className="flex justify-end mb-6">
        <a
          href="/novaAnalise"
          className="bg-[#0094FF] hover:bg-[#0077cc] text-white px-5 py-2 rounded-md text-sm font-semibold shadow transition-all"
        >
          + Nova Análise
        </a>
      </div>

      {erro && <p className="text-red-400">{erro}</p>}

      <div className="lexia-card overflow-auto">
        <table className="lexia-table">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Tipo de Análise</th>
              <th className="py-2 pr-4">Qtd. Documentos</th>
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {analises.map((item) => (
              <tr key={item.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                <td className="py-2 pr-4">{item.cliente.nome}</td>
                <td className="py-2 pr-4">{item.tipo}</td>
                <td className="py-2 pr-4">{item.quantidade_resultados}</td>
                <td className="py-2 pr-4">
                  {new Date(item.data_envio).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-2 pr-4">{badge(item.status)}</td>
                <td className="py-2 flex gap-2">
                  <a href={`/analises/${item.id}/resultados`} className="lexia-button">
                    Ver
                  </a>
                  <button className="lexia-button">Reprocessar</button>
                  <button
                    className="lexia-button"
                    onClick={() => handleExcluir(item.id)}
                  >
                    Excluir
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
