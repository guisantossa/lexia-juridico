import tiktoken


def contar_tokens(texto: str, modelo: str = "gpt-4") -> dict:
    """
    Retorna a contagem de tokens e caracteres para o texto dado.
    """
    encoding = tiktoken.encoding_for_model(modelo)
    tokens = encoding.encode(texto)
    return {"tokens": len(tokens), "caracteres": len(texto)}
