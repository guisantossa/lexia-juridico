from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, constr


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


# --- PERFIL DE USUÁRIO ---
class PerfilUsuarioOut(BaseModel):
    id: int
    perfil: str

    class Config:
        from_attributes = True


class UsuarioOut(BaseModel):
    id: UUID
    nome_completo: str
    email: EmailStr
    perfil_usuario: PerfilUsuarioOut
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
    telefone: str
    perfil_usuario_id: int
    cep: Optional[str]
    endereco: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    estado: Optional[str]


class UsuarioUpdate(BaseModel):
    nome_completo: str
    email: EmailStr
    telefone: Optional[str]
    perfil_usuario_id: int
    cep: Optional[str]
    endereco: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    estado: Optional[str]


# --- PERMISSÃO ---
class PermissaoOut(BaseModel):
    id: int
    nome_permissao: str

    class Config:
        from_attributes = True


class PermissaoPerfilUpdate(BaseModel):
    permissao_id: int
    permitido: bool


class MinhasPermissoesOut(BaseModel):
    perfil: str
    permissoes: list[PermissaoOut]


# schema.py


class ClienteBase(BaseModel):
    nome: str
    cpf: str  # Sem restrição aqui
    endereco: Optional[str]
    bairro: Optional[str]
    cidade: Optional[str]
    estado: Optional[str]
    cep: Optional[str]


class ClienteCreate(ClienteBase):
    cpf: constr(min_length=11, max_length=14)  # Valida só na criação


class ClienteOut(ClienteBase):
    id: UUID
    usuario_id: UUID

    class Config:
        from_attributes = True
