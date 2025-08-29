import uuid
from app.db.base import Base
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    CHAR,
    TIMESTAMP,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func




class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome_completo = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    telefone = Column(Text, unique=True)
    senha_hash = Column(Text, nullable=False)
    endereco = Column(Text)
    bairro = Column(Text)
    cidade = Column(Text)
    estado = Column(CHAR(2))
    cep = Column(Text)
    oab = Column(Text, unique=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP(timezone=True))
    atualizado_em = Column(TIMESTAMP(timezone=True))

    analises = relationship("Analise", back_populates="usuario")


class Analise(Base):
    __tablename__ = "analises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(Text, nullable=False)
    arquivo_original_url = Column(Text, nullable=False)
    arquivo_nome = Column(Text, nullable=False)

    status = Column(Integer, default=1)
    data_envio = Column(TIMESTAMP(timezone=True))
    data_conclusao = Column(TIMESTAMP(timezone=True))

    texto_extraido = Column(Text)
    texto_limpo = Column(Text)
    json_extraido = Column(JSONB)

    tokens = Column(Integer)
    caracteres = Column(Integer)

    resultado_pdf_url = Column(Text)
    revisao_humana = Column(Boolean, default=False)
    observacoes = Column(Text)

    usuario = relationship("Usuario", back_populates="analises")


class LivroPDF(Base):
    __tablename__ = "livros"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome = Column(String, nullable=False)
    caminho = Column(String, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())



class LivroPagina(Base):
    __tablename__ = "livros_pagina"

    id = Column(Integer, primary_key=True, autoincrement=True)
    livro_id = Column(UUID(as_uuid=True), ForeignKey("livros.id"), nullable=False)
    numero_pagina = Column(Integer, nullable=False)
    texto = Column(Text, nullable=False)
    texto_limpo = Column(Text, nullable=True)


class LivroChunk(Base):
    __tablename__ = "livros_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    livro_id = Column(UUID(as_uuid=True), ForeignKey("livros.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    texto = Column(Text, nullable=False)
    pagina_inicio = Column(Integer)
    pagina_fim = Column(Integer)
    embedding = Column(Vector(1536), nullable=True)
    metadados = Column("metadata", JSONB)


