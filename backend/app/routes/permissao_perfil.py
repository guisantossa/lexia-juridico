# routers/permissoes_perfil.py

from app.db.session import get_db
from app.models.models import PerfilUsuario, Permissao, PermissaoPerfil
from app.models.schemas import PermissaoOut, PermissaoPerfilUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/perfis", tags=["Permissões por Perfil"])


@router.get("/{perfil_id}/permissoes", response_model=list[PermissaoOut])
def listar_permissoes_por_perfil(perfil_id: int, db: Session = Depends(get_db)):
    perfil = db.query(PerfilUsuario).filter_by(id=perfil_id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")

    permissoes_ativas = (
        db.query(Permissao)
        .join(PermissaoPerfil)
        .filter(PermissaoPerfil.perfil_usuario_id == perfil_id)
        .filter(PermissaoPerfil.permitido)
        .all()
    )
    return permissoes_ativas


@router.put("/{perfil_id}/permissoes")
def atualizar_permissoes_do_perfil(
    perfil_id: int,
    permissoes: list[PermissaoPerfilUpdate],
    db: Session = Depends(get_db),
):
    perfil = db.query(PerfilUsuario).filter_by(id=perfil_id).first()
    if not perfil:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")

    for p in permissoes:
        relacao = (
            db.query(PermissaoPerfil)
            .filter_by(perfil_usuario_id=perfil_id, permissao_id=p.permissao_id)
            .first()
        )

        if relacao:
            relacao.permitido = p.permitido
        else:
            nova = PermissaoPerfil(
                perfil_usuario_id=perfil_id,
                permissao_id=p.permissao_id,
                permitido=p.permitido,
            )
            db.add(nova)

    db.commit()
    return {"detail": "Permissões atualizadas com sucesso"}
