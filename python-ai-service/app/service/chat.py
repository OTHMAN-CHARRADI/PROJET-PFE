from app.model.request_models import ChatRequest
from app.service.llm_service import client, MODEL
import httpx
import io
import base64
import logging
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_PROMPT = """Tu es Infobot, un assistant pédagogique intelligent spécialisé en informatique.
Tu aides des étudiants à apprendre la programmation et l'informatique en général.
Tu t'adaptes au niveau de l'étudiant : {level}.
Tu expliques les concepts clairement, tu fournis des exemples de code bien commentés en markdown.
Tu proposes des exercices progressifs et tu encourages l'étudiant.
Réponds toujours en français sauf si l'étudiant écrit en anglais.
Pour le code, utilise toujours des blocs markdown avec la syntaxe du langage appropriée.
Sois bienveillant, pédagogique et précis."""

SPRING_BASE_URL = "http://localhost:8080"

IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}
MIME_MAP = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
}


def _fetch_bytes(url: str) -> bytes | None:
    """Télécharge un fichier depuis Spring Boot (localhost)."""
    try:
        resp = httpx.get(url, timeout=15)
        resp.raise_for_status()
        return resp.content
    except Exception as e:
        logger.error(f"[Chat] Erreur téléchargement {url}: {e}")
        return None


def _build_messages(request: ChatRequest) -> list:
    system = request.system_prompt or DEFAULT_SYSTEM_PROMPT.format(
        level=request.level or "débutant"
    )
    messages = [{"role": "system", "content": system}]


    if request.conversation_history:
        for msg in request.conversation_history[-10:]:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})


    user_content = []

    if request.attached_files:
        for file_url in request.attached_files:
            ext = file_url.rsplit(".", 1)[-1].lower() if "." in file_url else ""
            filename = file_url.rsplit("/", 1)[-1]
            full_url = f"{SPRING_BASE_URL}{file_url}"
            file_bytes = _fetch_bytes(full_url)

            if file_bytes is None:
                user_content.append({
                    "type": "text",
                    "text": f"[Erreur : impossible de lire le fichier {filename}]"
                })
                continue

            if ext in IMAGE_EXTS:

                mime = MIME_MAP.get(ext, "image/png")
                b64 = base64.standard_b64encode(file_bytes).decode("utf-8")
                user_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime};base64,{b64}"
                    }
                })

            elif ext == "pdf":

                try:
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                        text = "\n".join(
                            page.extract_text() or "" for page in pdf.pages
                        )
                    text = text.strip()[:8000] or "[PDF sans texte extractible]"
                except ImportError:
                    text = "[pdfplumber non installé — pip install pdfplumber]"
                except Exception as e:
                    text = f"[Erreur lecture PDF : {e}]"

                user_content.append({
                    "type": "text",
                    "text": f"[Fichier joint : {filename}]\n{text}"
                })

            else:

                try:
                    text = file_bytes.decode("utf-8", errors="replace")[:8000]
                except Exception as e:
                    text = f"[Erreur décodage : {e}]"

                user_content.append({
                    "type": "text",
                    "text": f"[Fichier joint : {filename}]\n{text}"
                })


    text_message = request.message.strip() if request.message else ""
    if not text_message and request.attached_files:
        text_message = "Analyse ce fichier joint et aide-moi."

    if text_message:
        user_content.append({"type": "text", "text": text_message})


    if not request.attached_files:
        messages.append({"role": "user", "content": text_message})
    else:
        messages.append({"role": "user", "content": user_content})

    return messages


class Chat:

    async def stream_response(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        """Génère la réponse token par token via SSE."""
        messages = _build_messages(request)
        try:
            logger.info(f"[Chat] Stream → {MODEL}")
            stream = await client.chat.completions.create(
                model=MODEL,
                messages=messages,
                max_tokens=2048,
                temperature=0.7,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except Exception as e:
            logger.error(f"[Chat] Erreur stream: {e}")
            yield f"\n\n❌ Erreur : {str(e)}"