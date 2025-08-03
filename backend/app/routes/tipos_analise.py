from app.db.session import get_db
from app.models.models import TipoAnalise
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/tipos-analise/{nome_busca}")
def get_tipo_analise_por_nome(nome_busca: str, db: Session = Depends(get_db)):
    tipo = (
        db.query(TipoAnalise)
        .filter(TipoAnalise.nome.ilike(f"%{nome_busca}%"), TipoAnalise.ativo)
        .first()
    )
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de análise não encontrado")
    return {"id": tipo.id, "nome": tipo.nome, "descricao": tipo.descricao}


@router.get("/tipos-analise")
def listar_todos_tipos(db: Session = Depends(get_db)):
    tipos = db.query(TipoAnalise).filter(TipoAnalise.ativo).all()
    return [
        {"id": tipo.id, "nome": tipo.nome, "descricao": tipo.descricao}
        for tipo in tipos
    ]
