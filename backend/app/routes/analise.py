import os
from datetime import datetime

import requests
from app.db.session import get_db
from app.models.models import Analise, Cliente, Processo
from app.services.auth_dependencies import get_current_user
from app.services.historico import registrar_historico_token
from app.services.pdf_processor import (
    executar_divisao_por_tipo,
    extract_text_from_pdf,
    extract_text_google_ocr,
)
from app.services.tokenizer import contar_tokens
from app.services.utils import limpar_texto_ppp, limpar_texto_ppp_ocr, status_str
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from requests.auth import HTTPBasicAuth
from sqlalchemy import and_
from sqlalchemy.orm import Session

router = APIRouter()

N8N_WEBHOOK_URL_ANALISE = os.getenv(
    "N8N_WEBHOOK_URL_ANALISE", ""
)  # ajuste conforme seu webhook
N8N_PASS = os.getenv("N8N_PASS", "")  # coloque em .env idealmente
N8N_USER = os.getenv("N8N_USER", "")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/analises", summary="Listar análises do usuário")
def listar_analises(db: Session = Depends(get_db), usuario=Depends(get_current_user)):
    analises = (
        db.query(Analise)
        .filter(and_(Analise.usuario_id == usuario.id, Analise.status != 3))
        .all()
    )

    return [
        {
            "id": str(a.id),
            "arquivo_nome": a.arquivo_nome,
            "data_envio": a.data_envio,
            "tipo": a.tipo.nome,
            "cliente": {"nome": a.cliente.nome, "cpf": a.cliente.cpf},
            "processo": a.processo,
            "status": a.status,
        }
        for a in analises
    ]


@router.get("/analises/{analise_id}", summary="Vizualizar análises")
def vizualizar_analise(
    analise_id: str, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    analise = (
        db.query(Analise)
        .filter(and_(Analise.usuario_id == usuario.id, Analise.id == analise_id))
        .first()
    )
    return {
        "analise": {
            "id": str(analise.id),
            "arquivo_nome": analise.arquivo_nome,
            "data_envio": analise.data_envio.strftime("%Y-%m-%d %H:%M:%S"),
            "tipo": analise.tipo.nome,
            "cliente": {
                "nome": analise.cliente.nome,
                "cpf": analise.cliente.cpf,
            },
            "processo": {
                "numero": analise.processo.numero if analise.processo else None,
            },
            "status": status_str(analise.status),
            "texto_extraido": analise.texto_extraido,
            "texto_limpo": analise.texto_limpo,
            "json_extraido": analise.json_extraido,
            "pdf_url": analise.resultado_pdf_url,
        }
    }


@router.post("/analises/nova", summary="Fazer upload de um PDF para análise")
def nova_analise(
    tipo_id: int = Form(...),
    cliente_id: str = Form(...),
    processo_id: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    print("tipo_id:", tipo_id)
    print("cliente_id:", cliente_id)
    print("processo_id:", processo_id)
    print("file:", file.filename if file else None)
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="O arquivo precisa ser um PDF.")

        cliente = (
            db.query(Cliente).filter_by(id=cliente_id, usuario_id=usuario.id).first()
        )
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente não encontrado.")

        processo = None
        if processo_id:
            processo = (
                db.query(Processo)
                .filter_by(id=processo_id, usuario_id=usuario.id)
                .first()
            )
            if not processo:
                raise HTTPException(status_code=404, detail="Processo não encontrado.")

        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as f:
            f.write(file.file.read())

        texto = extract_text_from_pdf(file_location)
        if not texto or len(texto) < 200:
            texto = extract_text_google_ocr(file_location)

        if not texto or len(texto.strip()) == 0:
            raise HTTPException(
                status_code=400, detail="Não foi possível extrair conteúdo do PDF."
            )

        resultados = executar_divisao_por_tipo(tipo_id, texto)

        if len(resultados) > 1:
            raise HTTPException(
                status_code=400, detail="Mais de um documento no Anexo."
            )

        if not resultados:
            raise HTTPException(
                status_code=400, detail="Nenhum PPP reconhecido no documento enviado."
            )

        texto_extraido = resultados[0]
        texto_limpo = limpar_texto_ppp_ocr(texto_extraido)
        contagem = contar_tokens(texto_limpo)
        analise = Analise(
            usuario_id=usuario.id,
            cliente_id=cliente.id,
            tipo_id=tipo_id,
            processo_id=processo.id if processo else None,
            arquivo_nome=file.filename,
            arquivo_original_url=file_location,
            texto_extraido=texto_extraido,
            texto_limpo=texto_limpo,
            tokens=contagem["tokens"],
            caracteres=contagem["caracteres"],
            status=1,  # aguardando
            data_envio=datetime.now(),
        )
        db.add(analise)
        db.commit()
        db.refresh(analise)

        try:
            payload = {
                "analise_id": str(analise.id),
                "texto": texto_limpo,
                "usuario_id": str(usuario.id),
            }

            r = requests.post(
                N8N_WEBHOOK_URL_ANALISE,
                json=payload,
                auth=HTTPBasicAuth(N8N_USER, N8N_PASS),
                timeout=20,
            )
            r.raise_for_status()
        except Exception as e:
            analise.status = 5  # erro ao enviar
            db.commit()
            raise HTTPException(
                status_code=500, detail=f"Erro ao enviar ao n8n: {str(e)}"
            )

        return {
            "id": str(analise.id),
            "status": "aguardando",
            "arquivo": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analises/{analise_id}/executar", summary="Executar análise via IA")
def executar_analise_ppp(
    analise_id: str, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    analise = db.query(Analise).filter_by(id=analise_id, usuario_id=usuario.id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    analise.status = "processando"

    texto_limpo = limpar_texto_ppp(analise.texto_extraido)
    contagem = contar_tokens(texto_limpo)

    analise.texto_limpo = texto_limpo
    analise.tokens = contagem["tokens"]
    analise.caracteres = contagem["caracteres"]
    db.commit()

    registrar_historico_token(
        db=db, resultado_id=analise.id, etapa="leitura_ppp", tokens=contagem["tokens"]
    )

    payload = {
        "analise_id": analise_id,
        "texto": texto_limpo,
        "usuario_id": str(usuario.id),
    }

    try:
        r = requests.post(
            N8N_WEBHOOK_URL_ANALISE,
            json=payload,
            auth=HTTPBasicAuth(N8N_USER, N8N_PASS),
            timeout=20,
        )
        r.raise_for_status()
        return {"status": "enviado", "mensagem": "Análise enviada ao n8n"}
    except Exception as e:
        analise.status = "erro"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Erro ao chamar o n8n: {str(e)}")


@router.post(
    "/analises/{analise_id}/salvar-json", summary="Salvar JSON extraído pela IA"
)
def salvar_json_estruturado(
    analise_id: str,
    dados: dict,
    db: Session = Depends(get_db),
):
    analise = db.query(Analise).filter_by(id=analise_id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    analise.json_extraido = dados
    analise.status = 6  # estruturado
    analise.data_conclusao = datetime.now()
    db.commit()

    return {"msg": "JSON salvo com sucesso"}


@router.post("/analises/{analise_id}/excluir", summary="Marcar análise como excluída")
def excluir_analise(
    analise_id: str, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    analise = db.query(Analise).filter_by(id=analise_id, usuario_id=usuario.id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    analise.status = "excluido"
    db.commit()

    return {"status": "excluida", "analise_id": analise_id}
