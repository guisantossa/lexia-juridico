import { useEffect, useState } from 'react'
import { FaBook } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Referencias() {
  const [livros, setLivros] = useState([])
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/livros')
      .then((res) => {
        setLivros(res.data)
      })
      .catch(() => {
        setErro('Erro ao carregar livros.')
      })
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FaBook className="text-[#0094FF]" />
          Referências
        </h1>
      </div>

      <div className="flex justify-end mb-6">
        <a
          href="/livros/novo"
          className="bg-[#0094FF] hover:bg-[#0077cc] text-white px-5 py-2 rounded-md text-sm font-semibold shadow transition-all"
        >
          + Adicionar Livro
        </a>
      </div>

      {erro && <p className="text-red-400">{erro}</p>}

      <div className="lexia-card overflow-auto">
        <table className="lexia-table">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Data de Upload</th>
              <th className="py-2 pr-4">Nº de Páginas</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {livros.map((livro) => (
              <tr key={livro.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                <td className="py-2 pr-4">{livro.nome}</td>
                <td className="py-2 pr-4">
                  {new Date(livro.data_upload).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-2 pr-4">{livro.qtd_paginas}</td>
                <td className="py-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/livros/${livro.id}`)}
                    className="lexia-button"
                  >
                    Acessar
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
