from app.db.session import get_db
from app.models.models import PerfilUsuario
from app.models.schemas import PerfilUsuarioOut
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/perfis", tags=["Perfis de Usuário"])


@router.get("/", response_model=list[PerfilUsuarioOut])
def listar_perfis(db: Session = Depends(get_db)):
    return db.query(PerfilUsuario).all()


@router.get("/{perfil_id}", response_model=PerfilUsuarioOut)
def obter_perfil(perfil_id: int, db: Session = Depends(get_db)):
    perfil = db.query(PerfilUsuario).filter(PerfilUsuario.id == perfil_id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return perfil


@router.post("/", response_model=PerfilUsuarioOut)
def criar_perfil(perfil: PerfilUsuarioOut, db: Session = Depends(get_db)):
    novo = PerfilUsuario(**perfil.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.put("/{perfil_id}", response_model=PerfilUsuarioOut)
def atualizar_perfil(
    perfil_id: int, perfil: PerfilUsuarioOut, db: Session = Depends(get_db)
):
    obj = db.query(PerfilUsuario).filter(PerfilUsuario.id == perfil_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    obj.perfil = perfil.perfil
    db.commit()
    return obj


@router.delete("/{perfil_id}")
def deletar_perfil(perfil_id: int, db: Session = Depends(get_db)):
    obj = db.query(PerfilUsuario).filter(PerfilUsuario.id == perfil_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    db.delete(obj)
    db.commit()
    return {"detail": "Perfil deletado com sucesso"}
