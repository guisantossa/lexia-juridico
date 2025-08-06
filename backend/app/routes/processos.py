from uuid import UUID

from app.db.session import get_db
from app.models.models import Processo as ProcessoModel
from app.models.schemas import Processo as ProcessoSchema
from app.models.schemas import ProcessoCreate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/processos", tags=["Processos"])


@router.post("/", response_model=ProcessoSchema)
def criar_processo(processo: ProcessoCreate, db: Session = Depends(get_db)):
    db_processo = ProcessoModel(**processo.dict())
    db.add(db_processo)
    db.commit()
    db.refresh(db_processo)
    return db_processo


@router.get("/", response_model=list[ProcessoSchema])
def listar_processos(db: Session = Depends(get_db)):
    return db.query(ProcessoModel).all()


@router.get("/{processo_id}", response_model=ProcessoSchema)
def buscar_processo(processo_id: UUID, db: Session = Depends(get_db)):
    processo = db.query(ProcessoModel).filter(ProcessoModel.id == processo_id).first()
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    return processo
