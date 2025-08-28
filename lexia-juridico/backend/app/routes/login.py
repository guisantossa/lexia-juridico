from app.db.session import get_db
from app.models.models import Usuario
from app.models.schemas import TokenResponse, UsuarioCreate, UsuarioLogin
from app.services.auth_utils import (
    criar_token_acesso,
    gerar_hash_senha,
    verificar_senha,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse)
def login(dados: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == dados.email).first()

    if not usuario or not usuario.ativo:
        raise HTTPException(
            status_code=401, detail="Credenciais inválidas ou usuário inativo."
        )

    if not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos.")

    token = criar_token_acesso({"sub": str(usuario.id), "email": usuario.email})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/auth/register")
def register(dados: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == dados.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado.")

    senha_hash = gerar_hash_senha(dados.senha)
    novo_usuario = Usuario(
        nome_completo=dados.nome_completo,
        email=dados.email,
        telefone=dados.telefone,
        senha_hash=senha_hash,
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"msg": "Usuário criado com sucesso."}
