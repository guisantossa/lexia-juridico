from datetime import datetime
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
    nome: str
    cpf: constr(min_length=11, max_length=14)  # Valida só na criação

    class Config:
        from_attributes = True


class TribunalBase(BaseModel):
    sigla: str
    nome_completo: str


class TribunalCreate(TribunalBase):
    pass


class Tribunal(TribunalBase):
    id: UUID

    class Config:
        from_attributes = True


class ComarcaBase(BaseModel):
    nome: str
    codigo: str | None = None


class ComarcaCreate(ComarcaBase):
    tribunal_id: UUID


class Comarca(ComarcaBase):
    id: UUID
    tribunal_id: UUID

    class Config:
        from_attributes = True


class VaraBase(BaseModel):
    nome: str
    tipo_vara: str | None = None
    competencia: str | None = None


class VaraCreate(VaraBase):
    comarca_id: UUID


class Vara(VaraBase):
    id: UUID
    comarca_id: UUID

    class Config:
        from_attributes = True


class ProcessoBase(BaseModel):
    numero_processo: str
    classe_processo: str | None = None
    assunto: str | None = None
    fase_atual: str | None = None
    data_distribuicao: datetime | None = None
    ultimo_andamento: str | None = None
    data_ultimo_andamento: datetime | None = None
    pasta_url: str | None = None
    arquivo_peticao_inicial: str | None = None
    observacoes: str | None = None


class ProcessoCreate(ProcessoBase):
    usuario_id: UUID
    cliente_id: UUID
    tribunal_id: UUID
    comarca_id: UUID | None = None
    vara_id: UUID | None = None


class Processo(ProcessoBase):
    id: UUID
    usuario_id: UUID
    cliente_id: UUID
    tribunal_id: UUID
    comarca_id: UUID | None = None
    vara_id: UUID | None = None
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True
