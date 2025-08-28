from app.db.session import get_db
from app.models.models import Tribunal
from app.models.schemas import Tribunal as TribunalSchema
from app.models.schemas import TribunalCreate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/tribunais", tags=["Tribunais"])


@router.post("/", response_model=TribunalSchema)
def criar_tribunal(tribunal: TribunalCreate, db: Session = Depends(get_db)):
    db_tribunal = Tribunal(**tribunal.dict())
    db.add(db_tribunal)
    db.commit()
    db.refresh(db_tribunal)
    return db_tribunal


@router.get("/", response_model=list[TribunalSchema])
def listar_tribunais(db: Session = Depends(get_db)):
    return db.query(Tribunal).all()
