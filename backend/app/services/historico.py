import uuid

from app.models.models import HistoricoToken
from sqlalchemy.orm import Session


def registrar_historico_token(
    db: Session, resultado_id: uuid.UUID, etapa: str, tokens: int
):
    historico = HistoricoToken(
        resultado_analise_id=resultado_id, etapa=etapa, tokens=tokens
    )
    db.add(historico)
    db.commit()
