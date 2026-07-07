from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import logging
import httpx

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY = os.getenv("OPENAI_API_KEY", "")
if not API_KEY:
    logger.error("❌ OPENAI_API_KEY manquante dans .env !")

MODEL = "gpt-4.1-mini"

_timeout = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=5.0)

client = AsyncOpenAI(
    api_key=API_KEY,
    timeout=_timeout,
    http_client=httpx.AsyncClient(timeout=_timeout),
)


async def call_llm(
    messages: list,
    max_tokens: int = 2048,
    temperature: float = 0.5,
    models: list = None,
) -> str:
    """Appelle OpenAI gpt-4.1-mini"""
    try:
        logger.info(f"[LLM] → {MODEL} (max_tokens={max_tokens})")
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        content = response.choices[0].message.content
        finish_reason = response.choices[0].finish_reason
        logger.info(f"[LLM] ✅ {MODEL} — finish_reason={finish_reason}")


        if finish_reason == "length":
            logger.warning(f"[LLM] ⚠️ Réponse tronquée ! max_tokens={max_tokens} insuffisant.")

        if content and content.strip():
            return content
        raise Exception("Réponse vide du modèle")
    except Exception as e:
        err = str(e)
        logger.error(f"[LLM] ❌ {MODEL}: {err[:200]}")
        if "401" in err:
            raise Exception("❌ Clé API invalide — vérifier OPENAI_API_KEY dans .env")
        if "429" in err:
            raise Exception("❌ Rate limit OpenAI — réessayer dans quelques secondes")
        if "quota" in err.lower():
            raise Exception("❌ Quota OpenAI dépassé — vérifier votre plan")
        raise Exception(f"Erreur OpenAI : {err}")