from uuid import UUID

from app.db.session import get_db
from app.models.models import Vara
from app.models.schemas import Vara as VaraSchema
from app.models.schemas import VaraCreate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/varas", tags=["Varas"])


@router.post("/", response_model=VaraSchema)
def criar_vara(vara: VaraCreate, db: Session = Depends(get_db)):
    db_vara = Vara(**vara.dict())
    db.add(db_vara)
    db.commit()
    db.refresh(db_vara)
    return db_vara


@router.get("/", response_model=list[VaraSchema])
def listar_varas(db: Session = Depends(get_db)):
    return db.query(Vara).all()


@router.get("/por-comarca/{comarca_id}", response_model=list[VaraSchema])
def listar_por_comarca(comarca_id: UUID, db: Session = Depends(get_db)):
    return db.query(Vara).filter(Vara.comarca_id == comarca_id).all()
