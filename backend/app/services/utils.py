import re

from app.models.models import LivroChunk, LivroPagina
from sqlalchemy.orm import Session


def limpar_texto_ppp(texto: str) -> str:
    # mesma lógica que já definimos antes
    linhas = texto.splitlines()
    limpas = []
    ignorando = False

    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue

        linha_upper = linha.upper()

        if linha_upper.startswith("RESPONSÁVEIS PELAS INFORMAÇÕES"):
            ignorando = True
            continue
        if ignorando and len(linha) < 10:
            ignorando = False
            continue
        if ignorando:
            continue

        if linha_upper.startswith("15.9"):
            match = re.search(r"(Sim|Não)", linha, re.IGNORECASE)
            if match:
                limpas.append(f"15.9: {match.group(1)}")
            ignorando = True
            continue
        if ignorando and linha.startswith("Foi "):
            continue

        if any(
            p in linha_upper
            for p in ["AUTENTICADO", "PÁGINA", "CÓDIGO PENAL", "LEI Nº", "ANEXO ID"]
        ):
            continue
        if re.fullmatch(r"[-—]{3,}", linha):
            continue
        if len(linha) <= 3:
            continue

        limpas.append(linha)

    return "\n".join(limpas)


def limpar_texto_ppp_ocr(texto: str) -> str:
    # Remove primeira linha inteira
    linhas = texto.splitlines()
    texto = "\n".join(linhas[1:]) if len(linhas) > 1 else texto

    # Remove linhas muito curtas (ex: "S", ":", "i")
    texto = re.sub(r"(?m)^\s*[a-zA-Z0-9:]{1,3}\s*$", "", texto)

    # Junta palavras quebradas por hífen
    texto = re.sub(r"(\w+)-\n(\w+)", r"\1\2", texto)

    # Junta palavras quebradas por quebra de linha comum
    texto = re.sub(r"(\w)\n(\w)", r"\1 \2", texto)

    # Remove números de página soltos
    texto = re.sub(r"(?m)^\s*\d+\s*$", "", texto)

    # Normaliza quebras de linha
    texto = re.sub(r"\n{2,}", "\n", texto)

    # Remove espaços duplicados e bordas
    texto = re.sub(r"[ \t]+", " ", texto).strip()

    return texto


def dividir_texto_em_chunks(livro_id: str, db: Session, tamanho_max=2000):
    paginas = (
        db.query(LivroPagina)
        .filter_by(livro_id=livro_id)
        .order_by(LivroPagina.numero_pagina)
        .all()
    )
    if not paginas:
        return []

    chunks = []
    texto_buffer = ""
    pagina_inicio = pagina_fim = None
    chunk_index = 0

    for pagina in paginas:
        texto = pagina.texto_limpo or ""
        if not texto.strip():
            continue

        if not texto_buffer:
            pagina_inicio = pagina.numero_pagina

        texto_buffer += " " + texto.strip()
        pagina_fim = pagina.numero_pagina

        if len(texto_buffer) >= tamanho_max:
            chunks.append(
                {
                    "livro_id": livro_id,
                    "chunk_index": chunk_index,
                    "texto": texto_buffer.strip(),
                    "pagina_inicio": pagina_inicio,
                    "pagina_fim": pagina_fim,
                }
            )
            texto_buffer = ""
            chunk_index += 1

    # salva o resto que sobrar
    if texto_buffer:
        chunks.append(
            {
                "livro_id": livro_id,
                "chunk_index": chunk_index,
                "texto": texto_buffer.strip(),
                "pagina_inicio": pagina_inicio,
                "pagina_fim": pagina_fim,
            }
        )

    # grava no banco
    for chunk in chunks:
        db.add(LivroChunk(**chunk))
    db.commit()

    return {"chunks_gerados": len(chunks)}
