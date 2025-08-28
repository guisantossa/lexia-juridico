import io
import re
import string
from typing import List

import fitz  # PyMuPDF
import pytesseract
from google.cloud import vision_v1
from google.cloud.vision_v1 import types
from pdf2image import convert_from_path


def is_pdf_image_based(pdf_path: str) -> bool:
    """
    Retorna True se o PDF for baseado em imagem (sem texto real).
    """
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text = page.get_text("text").strip()
            if text:
                return False  # Contém texto legível
    return True  # Nenhuma página com texto


def extract_text_with_ocr(pdf_path: str) -> str:
    """
    Extrai texto de um PDF de imagem usando OCR (Tesseract).
    """
    images = convert_from_path(
        pdf_path, dpi=300, poppler_path=r"C:\Poppler\Library\bin"
    )
    all_text = ""
    for i, image in enumerate(images):
        text = pytesseract.image_to_string(image, lang="por")
        all_text += f"\n--- Página {i+1} ---\n{text}"

        image_path = f"debug_page_{i+1}.png"
        image.save(image_path)
    return all_text.strip()


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extrai texto diretamente de um PDF digital.
    Se o texto for ilegível (muitos caracteres não imprimíveis), retorna "".
    """
    all_text = ""
    with fitz.open(pdf_path) as doc:
        for i, page in enumerate(doc):
            text = page.get_text("text").strip()
            # Filtrar caracteres não imprimíveis
            if not text:
                continue
            printable_ratio = sum(c in string.printable for c in text) / (
                len(text) + 1e-5
            )
            if printable_ratio < 0.5:
                return ""  # Considera ilegível, força OCR depois
            all_text += f"\n--- Página {i+1} ---\n{text}"
    return all_text.strip()


def contar_ppps_em_texto(texto: str) -> int:
    """
    Conta quantas vezes o termo "PERFIL PROFISSIOGRÁFICO PREVIDENCIÁRIO" ou suas variações aparecem no texto.
    """
    marcadores = ["PERFIL PROFISSIOGRÁFICO PREVIDENCIÁRIO", "1- CNPJ", "1 - CNPJ"]
    texto_upper = texto.upper()
    return sum(texto_upper.count(marcador.upper()) for marcador in marcadores) or 1


def dividir_texto_em_ppps(texto: str) -> List[str]:
    # Divide pelas ocorrências de "PERFIL PROFISSIOGRÁFICO PREVIDENCIÁRIO"
    partes = re.split(r"(?=PERFIL\s+PROF.*?PREVIDENCI.*)", texto, flags=re.IGNORECASE)

    # Filtra apenas as partes que realmente contêm a expressão novamente
    return [
        parte.strip()
        for parte in partes
        if parte.strip()
        and re.search(r"PERFIL\s+PROF.*?PREVIDENCI.*", parte, flags=re.IGNORECASE)
    ]


def executar_divisao_por_tipo(tipo_id: int, texto: str):
    if tipo_id == 1:  # Análise de PPP
        return dividir_texto_em_ppps(texto)
    elif tipo_id == 2:  # Contestação IR (futuro)
        raise NotImplementedError("Divisão de IR ainda não implementada.")
    elif tipo_id == 3:  # Contestação de Laudo Médico (futuro)
        raise NotImplementedError("Divisão de Laudo Médico ainda não implementada.")
    else:
        raise ValueError("Tipo de análise inválido.")


def extract_text_google_ocr(pdf_path: str) -> str:
    client = vision_v1.ImageAnnotatorClient()

    with io.open(pdf_path, "rb") as pdf_file:
        content = pdf_file.read()

    input_config = types.InputConfig(content=content, mime_type="application/pdf")

    request = {
        "requests": [
            {
                "input_config": input_config,
                "features": [{"type_": vision_v1.Feature.Type.DOCUMENT_TEXT_DETECTION}],
                "image_context": {"language_hints": ["pt"]},
            }
        ]
    }

    response = client.batch_annotate_files(request)

    if response.responses[0].responses:
        full_text = ""
        for r in response.responses[0].responses:
            full_text += r.full_text_annotation.text
        return full_text.strip()

    return ""
