from app.db.session import get_db
from app.models.models import Permissao
from app.models.schemas import PermissaoOut
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/permissoes", tags=["Permissões"])


@router.get("/", response_model=list[PermissaoOut])
def listar_permissoes(db: Session = Depends(get_db)):
    return db.query(Permissao).all()


@router.get("/{permissao_id}", response_model=PermissaoOut)
def obter_permissao(permissao_id: int, db: Session = Depends(get_db)):
    obj = db.query(Permissao).filter(Permissao.id == permissao_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Permissão não encontrada")
    return obj


@router.post("/", response_model=PermissaoOut)
def criar_permissao(permissao: PermissaoOut, db: Session = Depends(get_db)):
    nova = Permissao(**permissao.dict())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova


@router.put("/{permissao_id}", response_model=PermissaoOut)
def atualizar_permissao(
    permissao_id: int, permissao: PermissaoOut, db: Session = Depends(get_db)
):
    obj = db.query(Permissao).filter(Permissao.id == permissao_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Permissão não encontrada")
    obj.nome_permissao = permissao.nome_permissao
    db.commit()
    return obj


@router.delete("/{permissao_id}")
def deletar_permissao(permissao_id: int, db: Session = Depends(get_db)):
    obj = db.query(Permissao).filter(Permissao.id == permissao_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Permissão não encontrada")
    db.delete(obj)
    db.commit()
    return {"detail": "Permissão deletada com sucesso"}
