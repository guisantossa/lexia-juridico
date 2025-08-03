import os
from datetime import datetime

import requests
from app.db.session import get_db
from app.models.models import Analise, Cliente, ResultadoAnalise
from app.services.auth_dependencies import get_current_user
from app.services.historico import registrar_historico_token
from app.services.pdf_processor import (
    executar_divisao_por_tipo,
    extract_text_from_pdf,
    extract_text_google_ocr,
)
from app.services.tokenizer import contar_tokens
from app.services.utils import limpar_texto_ppp
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from requests.auth import HTTPBasicAuth
from sqlalchemy import and_
from sqlalchemy.orm import Session

router = APIRouter()


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
            "quantidade_resultados": len(a.resultado) if a.resultado else 0,
        }
        for a in analises
    ]


@router.post("/analises/{analise_id}/excluir", summary="Marcar análise como excluída")
def excluir_analise(
    analise_id: str, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    analise = db.query(Analise).filter_by(id=analise_id, usuario_id=usuario.id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    analise.status = 3  # 3 = excluído
    db.commit()

    return {"status": "excluida", "analise_id": analise_id}


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analises/nova", summary="Fazer upload de um PDF para análise")
def nova_analise(
    tipo_id: int = Form(...),
    nome: str = Form(...),
    cpf: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="O arquivo precisa ser um PDF.")

        cliente = db.query(Cliente).filter_by(usuario_id=usuario.id, cpf=cpf).first()
        if not cliente:
            cliente = Cliente(usuario_id=usuario.id, nome=nome, cpf=cpf)
            db.add(cliente)
            db.commit()
            db.refresh(cliente)

        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as f:
            f.write(file.file.read())

        # Primeiro tenta extrair como texto digital
        texto = extract_text_from_pdf(file_location)
        if not texto or len(texto) < 200:
            texto = extract_text_google_ocr(file_location)

        if not texto or len(texto.strip()) == 0:
            raise HTTPException(
                status_code=400, detail="Não foi possível extrair conteúdo do PDF."
            )

        resultados = executar_divisao_por_tipo(tipo_id, texto)

        if not resultados:
            raise HTTPException(
                status_code=400, detail="Nenhum PPP reconhecido no documento enviado."
            )

        analise = Analise(
            usuario_id=usuario.id,
            cliente_id=cliente.id,
            tipo_id=tipo_id,
            arquivo_nome=file.filename,
            arquivo_original_url=file_location,
            data_envio=datetime.now(),
        )
        db.add(analise)
        db.commit()
        db.refresh(analise)

        for result in resultados:
            resultado = ResultadoAnalise(
                analise_id=analise.id,
                status="aguardando",
                json_extraido=None,
                texto_extraido=result,
                observacoes="PPP extraído do arquivo",
            )
            db.add(resultado)

        db.commit()

        return {
            "id": analise.id,
            "status": "aguardando",
            "quantidade_resultados": len(resultados),
            "arquivo": file.filename,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/analises/{analise_id}/resultados")
def obter_resultados_analise(
    analise_id: str, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    analise = db.query(Analise).filter_by(id=analise_id, usuario_id=usuario.id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada.")

    cliente = db.query(Cliente).filter_by(id=analise.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    resultados = db.query(ResultadoAnalise).filter_by(analise_id=analise.id).all()

    return {
        "analise": {
            "id": str(analise.id),
            "arquivo_nome": analise.arquivo_nome,
            "arquivo_url": analise.arquivo_original_url,
            "cliente": {"nome": cliente.nome, "cpf": cliente.cpf},
        },
        "resultados": [
            {
                "id": str(r.id),
                "status": r.status,
                "texto_extraido": r.texto_extraido,
                "data_envio": analise.data_envio.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for r in resultados
        ],
    }


N8N_WEBHOOK_URL_ANALISE = os.getenv(
    "N8N_WEBHOOK_URL_ANALISE", ""
)  # ajuste conforme seu webhook
N8N_PASS = os.getenv("N8N_PASS", "")  # coloque em .env idealmente
N8N_USER = os.getenv("N8N_USER", "")


@router.post(
    "/analises/{resultado_id}/executar",
    summary="Executar análise via IA para um resultado",
)
def executar_analise_ppp(
    resultado_id: str, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    resultado = db.query(ResultadoAnalise).filter_by(id=resultado_id).first()
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado não encontrado.")

    analise = (
        db.query(Analise)
        .filter_by(id=resultado.analise_id, usuario_id=usuario.id)
        .first()
    )
    if not analise:
        raise HTTPException(status_code=403, detail="Acesso não autorizado.")

    resultado.status = "processando"

    # Etapas separadas
    texto_limpo = limpar_texto_ppp(resultado.texto_extraido)
    contagem = contar_tokens(texto_limpo)

    resultado.texto_limpo = texto_limpo
    resultado.tokens = contagem["tokens"]
    resultado.caracteres = contagem["caracteres"]
    db.commit()

    # REGISTRO DE HISTÓRICO (módulo separado)
    registrar_historico_token(
        db=db, resultado_id=resultado.id, etapa="leitura_ppp", tokens=contagem["tokens"]
    )

    # Envio ao n8n
    payload = {
        "resultado_id": resultado_id,
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
        resultado.status = "erro"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Erro ao chamar o n8n: {str(e)}")


@router.post(
    "/analises/{resultado_id}/salvar-json",
    summary="Salvar resultado JSON extraído da IA",
)
def salvar_json_estruturado(
    resultado_id: str,
    dados: dict,
    db: Session = Depends(get_db),
    # usuario = Depends(get_current_user)
):
    resultado = (
        db.query(ResultadoAnalise)
        .join(Analise)
        .filter(
            ResultadoAnalise.id == resultado_id,
            # Analise.usuario_id == usuario.id
        )
        .first()
    )

    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado não encontrado")

    resultado.json_extraido = dados
    resultado.status = "estruturado"
    db.commit()

    return {"msg": "JSON salvo com sucesso"}
