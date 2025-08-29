from app.db.session import get_db
from app.models.models import Usuario
from app.services.auth_utils import ALGORITHM, SECRET_KEY
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from sqlalchemy.orm import Session
import os


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

BYPASS_TOKEN = "dev-bypass-token"

def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # 🔹 bypass em DEV
    if os.getenv("BYPASS_AUTH") == "1" and token == BYPASS_TOKEN:
        return Usuario(
            id="dev-user",
            nome_completo="Usuário Dev",
            email="dev@lexia.local",
            ativo=True
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario = db.query(Usuario).filter(Usuario.id == user_id, Usuario.ativo).first()
    if usuario is None:
        raise credentials_exception

    return usuario
