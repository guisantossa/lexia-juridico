# routers/usuario_me.py

from app.db.session import get_db
from app.models.models import PerfilUsuario, Permissao, PermissaoPerfil
from app.models.schemas import MinhasPermissoesOut
from app.services.auth_dependencies import get_current_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/me", tags=["Meu Perfil"])


@router.get("/permissoes", response_model=MinhasPermissoesOut)
def minhas_permissoes(db: Session = Depends(get_db), usuario=Depends(get_current_user)):
    perfil = db.query(PerfilUsuario).filter_by(id=usuario.perfil_usuario_id).first()

    permissoes = (
        db.query(Permissao)
        .join(PermissaoPerfil, Permissao.id == PermissaoPerfil.permissao_id)
        .filter(PermissaoPerfil.perfil_usuario_id == usuario.perfil_usuario_id)
        .filter(PermissaoPerfil.permitido)
        .all()
    )

    return {"perfil": perfil.perfil, "permissoes": permissoes}
