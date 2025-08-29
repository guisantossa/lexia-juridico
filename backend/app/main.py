import os

from app.routes import analise, livros, login, usuarios
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(root_path="/api")

# Garante que a pasta 'livros' exista
os.makedirs("livros", exist_ok=True)
app.mount("/media", StaticFiles(directory="livros"), name="livros")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
cors_origins = os.getenv("CORS_ORIGINS", "")
origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
# CORS para aceitar requisições do frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Substituir por URL específica do front em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analise.router, tags=["analises"])
app.include_router(login.router, tags=["login"])
app.include_router(livros.router, tags=["referencias"])

# NOVOS MÓDULOS
app.include_router(usuarios.router)


@app.get("/")
def read_root():
    return {"msg": "API PPP rodando"}
