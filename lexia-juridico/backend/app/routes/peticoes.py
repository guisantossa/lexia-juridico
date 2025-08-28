import os

import requests
from app.db.session import get_db
from app.models.models import LivroPDF
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")


@router.post(
    "/peticoes/gerar",
    summary="Enviar dados de livro + resultado para o n8n gerar petição",
)
def enviar_para_n8n(livro_id: str, resultado: dict, db: Session = Depends(get_db)):
    livro = db.query(LivroPDF).filter_by(id=livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")

    payload = {
        "livro_id": str(livro.id),
        "livro_nome": livro.nome,
        "dados_ppp": resultado,
    }

    try:
        response = requests.post(f"{N8N_WEBHOOK_URL}/gerar_peticao", json=payload)
        response.raise_for_status()
        return {"status": "ok", "resposta_n8n": response.json()}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao enviar para n8n: {str(e)}"
        )
