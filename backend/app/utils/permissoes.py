# utils/permissoes.py
from app.db import get_db
from app.models import Permissao, PermissaoPerfil
from app.services.auth_dependencies import get_current_user
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session


def verifica_permissao(nome_permissao: str):
    def dependencia(db: Session = Depends(get_db), usuario=Depends(get_current_user)):
        permissao = db.query(Permissao).filter_by(nome_permissao=nome_permissao).first()
        if not permissao:
            raise HTTPException(status_code=403, detail="Permissão inexistente")

        tem = (
            db.query(PermissaoPerfil)
            .filter_by(
                perfil_usuario_id=usuario.perfil_usuario_id,
                permissao_id=permissao.id,
                permitido=True,
            )
            .first()
        )

        if not tem:
            raise HTTPException(status_code=403, detail="Permissão negada")

    return Depends(dependencia)
