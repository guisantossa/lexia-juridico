from uuid import UUID

from app.db.session import get_db
from app.models.models import Cliente, Usuario
from app.models.schemas import ClienteCreate, ClienteOut
from app.services.auth_dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/clientes", tags=["Clientes"])


# Criar cliente
@router.post("", response_model=ClienteOut, include_in_schema=False)
def criar_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ja_existe = (
        db.query(Cliente)
        .filter(Cliente.usuario_id == usuario.id, Cliente.cpf == cliente.cpf)
        .first()
    )
    if ja_existe:
        raise HTTPException(
            status_code=400,
            detail="Cliente com esse CPF já cadastrado para este usuário.",
        )

    novo_cliente = Cliente(**cliente.dict(), usuario_id=usuario.id)
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente


# Listar todos os clientes do usuário ou buscar por nome
@router.get("", response_model=list[ClienteOut], include_in_schema=False)
def listar_ou_filtrar_clientes(
    nome: str = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    query = db.query(Cliente).filter(Cliente.usuario_id == usuario.id)
    if nome:
        query = query.filter(Cliente.nome.ilike(f"%{nome}%"))
    return query.limit(10).all()


# Obter cliente por ID
@router.get("/{cliente_id}/", response_model=ClienteOut)
def obter_cliente(
    cliente_id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    cliente = (
        db.query(Cliente)
        .filter(Cliente.id == cliente_id, Cliente.usuario_id == usuario.id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return cliente


# Atualizar cliente
@router.put("/{cliente_id}/", response_model=ClienteOut)
def atualizar_cliente(
    cliente_id: UUID,
    dados: ClienteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    cliente = (
        db.query(Cliente)
        .filter(Cliente.id == cliente_id, Cliente.usuario_id == usuario.id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    for key, value in dados.dict().items():
        setattr(cliente, key, value)

    db.commit()
    db.refresh(cliente)
    return cliente


# Deletar cliente
@router.delete("/{cliente_id}")
def deletar_cliente(
    cliente_id: UUID,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    cliente = (
        db.query(Cliente)
        .filter(Cliente.id == cliente_id, Cliente.usuario_id == usuario.id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    db.delete(cliente)
    db.commit()
    return {"detail": "Cliente deletado com sucesso"}
