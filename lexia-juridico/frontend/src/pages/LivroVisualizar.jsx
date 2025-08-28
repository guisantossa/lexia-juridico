import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function LivroVisualizar() {
  const { id } = useParams();
  const [paginas, setPaginas] = useState([]);
  const [livro, setLivro] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.get(`/livros/${id}`)
      .then((res) => {
        setLivro(res.data.livro);
        setPaginas(res.data.paginas);
      })
      .catch(() => {
        setErro("Erro ao carregar livro.");
      });
  }, [id]);

  const avancar = () => {
    if (paginaAtual < paginas.length - 1) setPaginaAtual((p) => p + 1);
  };

  const voltar = () => {
    if (paginaAtual > 0) setPaginaAtual((p) => p - 1);
  };

  const irPara = (e) => {
    const pagina = Number(e.target.value) - 1;
    if (pagina >= 0 && pagina < paginas.length) {
      setPaginaAtual(pagina);
    }
  };

  if (erro) return <p className="text-red-500">{erro}</p>;
  if (!livro) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Livro: {livro.nome}</h1>

      <div className="lexia-card p-4 flex flex-col items-center">
        <img
          src={paginas[paginaAtual]?.imagem_url}
          alt={`Página ${paginaAtual + 1}`}
          className="max-h-[70vh] rounded shadow"
        />

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={voltar}
            disabled={paginaAtual === 0}
            className="lexia-button"
          >
            <FaArrowLeft />
          </button>

          <input
            type="number"
            min={1}
            max={paginas.length}
            value={paginaAtual + 1}
            onChange={irPara}
            className="lexia-input w-20 text-center"
          />

          <span className="text-sm text-neutral-400">
            / {paginas.length}
          </span>

          <button
            onClick={avancar}
            disabled={paginaAtual === paginas.length - 1}
            className="lexia-button"
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
