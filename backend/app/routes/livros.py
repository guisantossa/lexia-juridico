# routers/livros.py

import io
import os
from uuid import uuid4

from app.db.session import get_db
from app.models.models import LivroChunk, LivroPagina, LivroPDF
from app.services.utils import limpar_texto_ppp_ocr
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from google.cloud import vision
from openai import OpenAI
from pdf2image import convert_from_bytes
from PIL import ImageFile
from sqlalchemy.orm import Session
from tqdm import tqdm

BASE_URL = "http://localhost:8000"

openai = OpenAI(api_key=os.getenv("OPEN_IA_KEY"))

ImageFile.LOAD_TRUNCATED_IMAGES = True
router = APIRouter()


@router.post("/livros/upload", summary="Fazer upload do PDF e gerar imagens")
def upload_pdf(nome: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Arquivo deve ser PDF")

    livro_id = uuid4()
    pasta_destino = f"livros/{livro_id}"
    os.makedirs(pasta_destino, exist_ok=True)
    print("Lendo arquivo PDF...")
    conteudo = file.file.read()
    paginas = convert_from_bytes(conteudo, dpi=300, thread_count=4, last_page=240)
    # paginas = convert_from_bytes(conteudo, dpi=300, first_page=169, last_page=169, poppler_path=poppler_path)
    print(f"[+] {len(paginas)} páginas encontradas no PDF")
    for idx, pagina in tqdm(enumerate(paginas, start=1), total=len(paginas)):
        caminho_img = os.path.join(pasta_destino, f"pagina_{idx}.jpg")
        pagina.save(caminho_img, "JPEG")
        print(f"[+] Página {idx} salva em {caminho_img}")

    livro = LivroPDF(id=livro_id, nome=nome, caminho=pasta_destino)
    db.add(livro)
    db.commit()

    return {"id": str(livro_id), "nome": nome, "paginas": len(paginas)}


@router.get("/livros", summary="Listar livros")
def listar_livros(db: Session = Depends(get_db)):
    livros = db.query(LivroPDF).all()
    return [
        {
            "id": str(livro.id),
            "nome": livro.nome,
            "data_upload": livro.criado_em.isoformat() if livro.criado_em else None,
            "qtd_paginas": db.query(LivroPagina).filter_by(livro_id=livro.id).count(),
        }
        for livro in livros
    ]


@router.post(
    "/livros/{livro_id}/processar", summary="Processar imagens com OCR do Vision"
)
def processar_livro(livro_id: str, db: Session = Depends(get_db)):
    livro = db.query(LivroPDF).filter_by(id=livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    caminho_base = livro.caminho
    if not os.path.isdir(caminho_base):
        raise HTTPException(status_code=400, detail="Pasta de imagens não existe")

    client = vision.ImageAnnotatorClient()

    arquivos = sorted(os.listdir(caminho_base))
    paginas_processadas = 0
    for filename in tqdm(arquivos, desc="Processando páginas"):
        if filename.endswith(".jpg"):
            numero_pagina = int(filename.replace("pagina_", "").replace(".jpg", ""))

            # ⚠️ Checa antes de mandar pro Vision
            existe = (
                db.query(LivroPagina)
                .filter_by(livro_id=livro.id, numero_pagina=numero_pagina)
                .first()
            )

            if existe:
                print(f"[-] Página {numero_pagina} já processada, pulando.")
                continue

            imagem_path = os.path.join(caminho_base, filename)
            with io.open(imagem_path, "rb") as image_file:
                content = image_file.read()

            image = vision.Image(content=content)
            response = client.document_text_detection(image=image)
            texto_extraido = response.full_text_annotation.text.strip()

            if not texto_extraido:
                continue

            registro = LivroPagina(
                livro_id=livro.id, numero_pagina=numero_pagina, texto=texto_extraido
            )
            try:
                db.add(registro)
                db.commit()
                paginas_processadas += 1
            except Exception as e:
                db.rollback()
                print(f"[x] Falha ao salvar página {numero_pagina}: {str(e)}")

    db.commit()

    return {"status": "ok", "paginas_processadas": paginas_processadas}


@router.get("/livros/{livro_id}", summary="Vizualizar os livros")
def visualizar_livro(livro_id: str, db: Session = Depends(get_db)):
    livro = db.query(LivroPDF).filter_by(id=livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    paginas = (
        db.query(LivroPagina)
        .filter_by(livro_id=livro_id)
        .order_by(LivroPagina.numero_pagina.asc())
        .all()
    )

    return {
        "livro": {"id": str(livro.id), "nome": livro.nome},
        "paginas": [
            {
                "numero": p.numero_pagina,
                "imagem_url": f"http://localhost:8000/media/{livro.id}/pagina_{p.numero_pagina}.jpg",
            }
            for p in paginas
        ],
    }


@router.post(
    "/livros/{livro_id}/limpar", summary="Limpar texto OCR e salvar em texto_limpo"
)
def limpar_textos(livro_id: str, db: Session = Depends(get_db)):
    paginas = db.query(LivroPagina).filter_by(livro_id=livro_id).all()
    if not paginas:
        raise HTTPException(
            status_code=404, detail="Nenhuma página encontrada para o livro."
        )

    paginas_processadas = 0

    for pagina in tqdm(paginas, desc="Limpando texto"):
        texto_original = pagina.texto or ""

        texto_tratado = limpar_texto_ppp_ocr(texto_original)
        pagina.texto_limpo = texto_tratado
        db.add(pagina)
        paginas_processadas += 1
        db.commit()

    return {"status": "ok", "paginas_processadas": paginas_processadas}


@router.post(
    "/livros/{livro_id}/chunk", summary="Dividir texto limpo em chunks relevantes"
)
def gerar_chunks(livro_id: str, db: Session = Depends(get_db)):
    paginas = (
        db.query(LivroPagina)
        .filter_by(livro_id=livro_id)
        .order_by(LivroPagina.numero_pagina)
        .all()
    )

    if not paginas:
        raise HTTPException(
            status_code=404, detail="Nenhum texto encontrado para esse livro."
        )

    PALAVRAS_CHAVE = [
        "exposição",
        "ruído",
        "agente",
        "químico",
        "biológico",
        "epi",
        "epc",
        "insalubridade",
        "periculosidade",
        "conclusão",
        "laudo",
        "perícia",
        "engenheiro",
    ]

    def contem_termo_relevante(texto):
        texto_lower = texto.lower()
        return any(p in texto_lower for p in PALAVRAS_CHAVE)

    chunks = []
    texto_buffer = ""
    pagina_inicio = pagina_fim = None
    chunk_index = 0
    tamanho_max = 2000  # ~300-500 tokens como base

    for pagina in tqdm(paginas):
        texto = pagina.texto_limpo or ""
        if not texto.strip():
            continue

        if not texto_buffer:
            pagina_inicio = pagina.numero_pagina

        texto_buffer += " " + texto.strip()
        pagina_fim = pagina.numero_pagina

        if len(texto_buffer) >= tamanho_max:
            if contem_termo_relevante(texto_buffer):
                chunk = LivroChunk(
                    livro_id=livro_id,
                    chunk_index=chunk_index,
                    texto=texto_buffer.strip(),
                    pagina_inicio=pagina_inicio,
                    pagina_fim=pagina_fim,
                    metadados={
                        "livro_id": str(livro_id),
                        "pagina_inicio": pagina_inicio,
                        "pagina_fim": pagina_fim,
                        "chunk_index": chunk_index,
                    },
                )
                db.add(chunk)
                chunks.append(chunk)
                chunk_index += 1

            # sempre zera o buffer após tentar salvar
            texto_buffer = ""
            pagina_inicio = pagina_fim = None

    # salva último chunk se sobrou e for relevante
    if texto_buffer.strip() and contem_termo_relevante(texto_buffer):
        chunk = LivroChunk(
            livro_id=livro_id,
            chunk_index=chunk_index,
            texto=texto_buffer.strip(),
            pagina_inicio=pagina_inicio,
            pagina_fim=pagina_fim,
            metadados={
                "livro_id": str(livro_id),
                "pagina_inicio": pagina_inicio,
                "pagina_fim": pagina_fim,
                "chunk_index": chunk_index,
            },
        )
        db.add(chunk)
        chunks.append(chunk)

    db.commit()

    return {"status": "ok", "chunks_relevantes_gerados": len(chunks)}


@router.post(
    "/livros/{livro_id}/gerar-embeddings",
    summary="Gerar embeddings dos chunks de um livro",
)
def gerar_embeddings_livro(livro_id: str, db: Session = Depends(get_db)):
    chunks = (
        db.query(LivroChunk)
        .filter_by(livro_id=livro_id)
        .order_by(LivroChunk.chunk_index.asc())
        .all()
    )

    if not chunks:
        raise HTTPException(
            status_code=404, detail="Nenhum chunk encontrado para esse livro."
        )

    gerados = 0
    for chunk in chunks:
        if chunk.embedding is not None:
            continue  # pular se já tem embedding (pode remover isso se quiser sempre substituir)

        try:
            resp = openai.embeddings.create(
                model="text-embedding-ada-002", input=chunk.texto
            )
            chunk.embedding = resp.data[0].embedding
            db.add(chunk)
            gerados += 1
        except Exception as e:
            print(f"Erro ao gerar embedding do chunk {chunk.chunk_index}: {e}")

        db.commit()
        print(f"Chunk {chunk.chunk_index} embeddado com sucesso")

    return {"status": "ok", "embeddings_gerados": gerados}
