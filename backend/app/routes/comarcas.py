from uuid import UUID

from app.db.session import get_db
from app.models.models import Comarca as ComarcaModel  # Model SQLAlchemy
from app.models.schemas import Comarca as ComarcaSchema  # Schema Pydantic
from app.models.schemas import ComarcaCreate
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/comarcas", tags=["Comarcas"])


@router.post("/", response_model=ComarcaSchema)
def criar_comarca(comarca: ComarcaCreate, db: Session = Depends(get_db)):
    db_comarca = ComarcaModel(**comarca.dict())
    db.add(db_comarca)
    db.commit()
    db.refresh(db_comarca)
    return db_comarca


@router.get("/", response_model=list[ComarcaSchema])
def listar_comarcas(db: Session = Depends(get_db)):
    return db.query(ComarcaModel).all()


@router.get("/por-tribunal/{tribunal_id}", response_model=list[ComarcaSchema])
def listar_por_tribunal(tribunal_id: UUID, db: Session = Depends(get_db)):
    return db.query(ComarcaModel).filter(ComarcaModel.tribunal_id == tribunal_id).all()
