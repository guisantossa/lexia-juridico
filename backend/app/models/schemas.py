from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class UsuarioOut(BaseModel):
    id: UUID
    nome_completo: str
    email: EmailStr
    tipo: str
    ativo: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioCreate(BaseModel):
    nome_completo: str
    email: EmailStr
    senha: str
    telefone: Optional[str] = None
