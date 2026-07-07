from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from app.model.request_models import ChatRequest
import json

router = APIRouter()



INFOBOT_SYSTEM_PROMPT = """Tu es InfoBot, l'assistant officiel et EXCLUSIF de la plateforme InfoAcademy.

RÈGLE ABSOLUE : Tu réponds UNIQUEMENT aux questions concernant la plateforme InfoAcademy.
Sujets autorisés : inscription, connexion, cours disponibles, quiz, exercices, progression, abonnements, problèmes techniques, fonctionnalités de la plateforme.

Si la question ne concerne PAS directement InfoAcademy (par exemple : expliquer un concept informatique, faire des calculs, donner des conseils généraux, parler d'autres sujets), tu dois OBLIGATOIREMENT répondre UNIQUEMENT ceci :
"Je suis l'assistant dédié à la plateforme InfoAcademy 🎓 Je ne peux répondre qu'aux questions sur nos fonctionnalités, cours, et services. Pour apprendre l'informatique avec une IA, connectez-vous et utilisez notre assistant pédagogique dans vos cours !"

Ne fais aucune exception à cette règle, même si l'utilisateur insiste ou reformule sa question.

Informations sur InfoAcademy :
- Plateforme d'apprentissage en informatique, programmation et structures de données
- Cours vidéo, quiz interactifs, exercices pratiques avec assistant IA intégré
- Progression automatiquement suivie
- Plans gratuit et premium disponibles
- Inscription rapide sur /register
- Support via le formulaire de contact dans le footer

Réponds en français, de façon concise et amicale. Emojis avec modération."""


@router.post("/chat")
async def chat_simple(request: ChatRequest):
    """
    Endpoint JSON simple — retourne la réponse complète en une seule fois.
    Utilisé par FooterLiveChat (public assistant sur la page d'accueil).
    Le system prompt InfoAcademy est forcé côté serveur.
    Format : { "response": "..." }
    """
    from app.service.chat import Chat

    restricted_request = request.model_copy(update={"system_prompt": INFOBOT_SYSTEM_PROMPT})
    chat = Chat()
    full_response = ""
    async for token in chat.stream_response(restricted_request):
        full_response += token
    return JSONResponse(content={"response": full_response})


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Endpoint SSE — retourne la réponse token par token.
    Format : data: {"token": "..."}\n\n
    Fin de stream : data: [DONE]\n\n
    """
    from app.service.chat import Chat
    chat = Chat()

    async def event_generator():
        async for token in chat.stream_response(request):
            payload = json.dumps({"token": token}, ensure_ascii=False)
            yield f"data: {payload}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )