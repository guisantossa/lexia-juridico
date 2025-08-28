from uuid import UUID

from app.db.session import get_db
from app.models.models import ModelosMinuta
from app.services.auth_dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/modelos", summary="Listar modelos do usuário")
def listar_modelos(db: Session = Depends(get_db), usuario=Depends(get_current_user)):
    modelos = (
        db.query(ModelosMinuta)
        .filter(ModelosMinuta.usuario_id == usuario.id)
        .order_by(ModelosMinuta.criado_em.desc())
        .all()
    )

    return [
        {
            "id": str(m.id),
            "nome": m.nome,
            "descricao": m.descricao,
            "tags": m.tags,
            "conteudo_html": m.conteudo_html,
            "criado_em": m.criado_em,
        }
        for m in modelos
    ]


@router.get("/modelos/{modelo_id}", summary="Obter modelo por ID")
def obter_modelo(
    modelo_id: UUID, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    modelo = (
        db.query(ModelosMinuta).filter_by(id=modelo_id, usuario_id=usuario.id).first()
    )
    if not modelo:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    return {
        "id": str(modelo.id),
        "nome": modelo.nome,
        "descricao": modelo.descricao,
        "tags": modelo.tags,
        "conteudo_html": modelo.conteudo_html,
        "criado_em": modelo.criado_em,
    }


@router.post("/modelos", summary="Criar novo modelo")
def criar_modelo(
    dados: dict, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    if not dados.get("nome") or not dados.get("conteudo_html"):
        raise HTTPException(status_code=400, detail="Nome e conteúdo são obrigatórios.")

    modelo = ModelosMinuta(
        usuario_id=usuario.id,
        nome=dados["nome"],
        descricao=dados.get("descricao"),
        tags=dados.get("tags", []),
        conteudo_html=dados["conteudo_html"],
    )
    db.add(modelo)
    db.commit()
    db.refresh(modelo)
    return {"id": str(modelo.id), "status": "criado"}


@router.put("/modelos/{modelo_id}", summary="Atualizar modelo")
def atualizar_modelo(
    modelo_id: UUID,
    dados: dict,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    modelo = (
        db.query(ModelosMinuta).filter_by(id=modelo_id, usuario_id=usuario.id).first()
    )
    if not modelo:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    if not dados.get("nome") or not dados.get("conteudo_html"):
        raise HTTPException(status_code=400, detail="Nome e conteúdo são obrigatórios.")

    modelo.nome = dados["nome"]
    modelo.descricao = dados.get("descricao")
    modelo.tags = dados.get("tags", [])
    modelo.conteudo_html = dados["conteudo_html"]

    db.commit()
    return {"status": "atualizado", "id": str(modelo.id)}


@router.delete("/modelos/{modelo_id}", summary="Excluir modelo")
def excluir_modelo(
    modelo_id: UUID, db: Session = Depends(get_db), usuario=Depends(get_current_user)
):
    modelo = (
        db.query(ModelosMinuta).filter_by(id=modelo_id, usuario_id=usuario.id).first()
    )
    if not modelo:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    db.delete(modelo)
    db.commit()
    return {"status": "excluido", "id": str(modelo.id)}
