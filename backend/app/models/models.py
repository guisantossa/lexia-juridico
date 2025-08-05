import uuid

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
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()


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
    perfil_usuario_id = Column(
        ForeignKey("perfil_usuario.id"), nullable=False, default=2
    )
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP(timezone=True))
    atualizado_em = Column(TIMESTAMP(timezone=True))

    clientes = relationship("Cliente", back_populates="usuario")
    analises = relationship("Analise", back_populates="usuario")
    perfil_usuario = relationship("PerfilUsuario", back_populates="usuarios")


class Cliente(Base):
    __tablename__ = "clientes"
    __table_args__ = (UniqueConstraint("usuario_id", "cpf"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    nome = Column(Text, nullable=False)
    cpf = Column(Text, nullable=False)
    endereco = Column(Text)
    bairro = Column(Text)
    cidade = Column(Text)
    estado = Column(Text)
    cep = Column(Text)

    usuario = relationship("Usuario", back_populates="clientes")
    analises = relationship("Analise", back_populates="cliente")


class TipoAnalise(Base):
    __tablename__ = "tipos_analise"

    id = Column(Integer, primary_key=True)
    nome = Column(Text, unique=True, nullable=False)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)

    analises = relationship("Analise", back_populates="tipo")


class Analise(Base):
    __tablename__ = "analises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id"), nullable=False)
    tipo_id = Column(Integer, ForeignKey("tipos_analise.id"), nullable=False)
    arquivo_original_url = Column(Text, nullable=False)
    arquivo_nome = Column(Text, nullable=False)
    data_envio = Column(TIMESTAMP(timezone=True))
    status = Column(Integer, default=1)  # 1: ativo, 2: finalizado, 3: excluido
    usuario = relationship("Usuario", back_populates="analises")
    cliente = relationship("Cliente", back_populates="analises")
    tipo = relationship("TipoAnalise", back_populates="analises")
    resultado = relationship("ResultadoAnalise", back_populates="analise")


class ResultadoAnalise(Base):
    __tablename__ = "resultados_analise"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analise_id = Column(UUID(as_uuid=True), ForeignKey("analises.id"), nullable=False)
    status = Column(Text, default="aguardando")
    json_extraido = Column(JSONB)
    texto_extraido = Column(Text)
    resultado_pdf_url = Column(Text)
    data_conclusao = Column(TIMESTAMP(timezone=True))
    revisao_humana = Column(Boolean, default=False)
    observacoes = Column(Text)

    analise = relationship("Analise", back_populates="resultado")


class HistoricoToken(Base):
    __tablename__ = "historico_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resultado_analise_id = Column(
        UUID(as_uuid=True), ForeignKey("resultados_analise.id"), nullable=False
    )
    etapa = Column(String, nullable=False)
    tokens = Column(Integer, nullable=False)
    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())

    resultado = relationship("ResultadoAnalise", backref="historicos_tokens")


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


class ModelosMinuta(Base):
    __tablename__ = "modelos_minuta"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String, nullable=False)
    descricao = Column(Text)
    tags = Column(ARRAY(String))
    conteudo_html = Column(Text, nullable=False)
    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())
    atualizado_em = Column(
        TIMESTAMP(timezone=True), onupdate=func.now(), server_default=func.now()
    )


class PerfilUsuario(Base):
    __tablename__ = "perfil_usuario"

    id = Column(Integer, primary_key=True, index=True)
    perfil = Column(String, unique=True, nullable=False)

    permissoes = relationship("PermissaoPerfil", back_populates="perfil")
    usuarios = relationship("Usuario", back_populates="perfil_usuario")


class Permissao(Base):
    __tablename__ = "permissoes"

    id = Column(Integer, primary_key=True, index=True)
    nome_permissao = Column(String, unique=True, nullable=False)

    perfis = relationship("PermissaoPerfil", back_populates="permissao")


class PermissaoPerfil(Base):
    __tablename__ = "permissoes_perfil"

    perfil_usuario_id = Column(
        Integer, ForeignKey("perfil_usuario.id", ondelete="CASCADE"), primary_key=True
    )
    permissao_id = Column(
        Integer, ForeignKey("permissoes.id", ondelete="CASCADE"), primary_key=True
    )
    permitido = Column(Boolean, default=False)

    perfil = relationship("PerfilUsuario", back_populates="permissoes")
    permissao = relationship("Permissao", back_populates="perfis")


class Tribunal(Base):
    __tablename__ = "tribunais"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sigla = Column(String, nullable=False, unique=True)
    nome_completo = Column(String, nullable=False)

    comarcas = relationship("Comarca", back_populates="tribunal")


class Comarca(Base):
    __tablename__ = "comarcas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tribunal_id = Column(UUID(as_uuid=True), ForeignKey("tribunais.id"), nullable=False)
    nome = Column(String, nullable=False)
    codigo = Column(String)

    tribunal = relationship("Tribunal", back_populates="comarcas")
    varas = relationship("Vara", back_populates="comarca")


class Vara(Base):
    __tablename__ = "varas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comarca_id = Column(UUID(as_uuid=True), ForeignKey("comarcas.id"), nullable=False)
    tipo_vara = Column(String)
    nome = Column(String, nullable=False)
    competencia = Column(String)

    comarca = relationship("Comarca", back_populates="varas")


class Processo(Base):
    __tablename__ = "processos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id"), nullable=False)
    numero_processo = Column(String, nullable=False, unique=True)

    tribunal_id = Column(UUID(as_uuid=True), ForeignKey("tribunais.id"), nullable=False)
    comarca_id = Column(UUID(as_uuid=True), ForeignKey("comarcas.id"))
    vara_id = Column(UUID(as_uuid=True), ForeignKey("varas.id"))

    classe_processo = Column(String)
    assunto = Column(String)
    fase_atual = Column(String)

    data_distribuicao = Column(TIMESTAMP)
    ultimo_andamento = Column(Text)
    data_ultimo_andamento = Column(TIMESTAMP)

    pasta_url = Column(Text)
    arquivo_peticao_inicial = Column(Text)
    observacoes = Column(Text)

    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())
    atualizado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())
