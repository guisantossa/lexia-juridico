"""initial
Revision ID: 0001_initial
Revises: 1
Create Date: 2025-08-28
"""

import uuid

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "usuarios",
        sa.Column(
            "id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
        ),
        sa.Column("nome_completo", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), unique=True, nullable=False),
        sa.Column("telefone", sa.Text(), unique=True),
        sa.Column("senha_hash", sa.Text(), nullable=False),
        sa.Column("endereco", sa.Text()),
        sa.Column("bairro", sa.Text()),
        sa.Column("cidade", sa.Text()),
        sa.Column("estado", sa.CHAR(2)),
        sa.Column("cep", sa.Text()),
        sa.Column("oab", sa.Text(), unique=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("criado_em", sa.TIMESTAMP(timezone=True)),
        sa.Column("atualizado_em", sa.TIMESTAMP(timezone=True)),
    )

    op.create_table(
        "analises",
        sa.Column(
            "id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
        ),
        sa.Column(
            "usuario_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("usuarios.id"),
            nullable=False,
        ),
        sa.Column("arquivo_original_url", sa.Text(), nullable=False),
        sa.Column("arquivo_nome", sa.Text(), nullable=False),
        sa.Column("titulo", sa.Text(), nullable=False),
        sa.Column("status", sa.Integer(), server_default="1"),
        sa.Column("data_envio", sa.TIMESTAMP(timezone=True)),
        sa.Column("data_conclusao", sa.TIMESTAMP(timezone=True)),
        sa.Column("texto_extraido", sa.Text()),
        sa.Column("texto_limpo", sa.Text()),
        sa.Column("json_extraido", sa.dialects.postgresql.JSONB),
        sa.Column("tokens", sa.Integer()),
        sa.Column("caracteres", sa.Integer()),
        sa.Column("resultado_pdf_url", sa.Text()),
        sa.Column("revisao_humana", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("observacoes", sa.Text()),
    )

    op.create_table(
        "livros",
        sa.Column(
            "id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
        ),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("caminho", sa.String(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )

    op.create_table(
        "livros_pagina",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "livro_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("livros.id"),
            nullable=False,
        ),
        sa.Column("numero_pagina", sa.Integer, nullable=False),
        sa.Column("texto", sa.Text, nullable=False),
        sa.Column("texto_limpo", sa.Text),
    )

    op.create_table(
        "livros_chunks",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "livro_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("livros.id"),
            nullable=False,
        ),
        sa.Column("chunk_index", sa.Integer, nullable=False),
        sa.Column("texto", sa.Text, nullable=False),
        sa.Column("pagina_inicio", sa.Integer),
        sa.Column("pagina_fim", sa.Integer),
        sa.Column("embedding", Vector(1536)),
        sa.Column("metadata", sa.dialects.postgresql.JSONB),
    )


def downgrade():
    op.drop_table("livros_chunks")
    op.drop_table("livros_pagina")
    op.drop_table("livros")
    op.drop_table("analises")
    op.drop_table("usuarios")
