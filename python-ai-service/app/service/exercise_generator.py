from app.model.request_models import ExerciseRequest
from app.model.response_models import ExerciseResponse
from app.service.llm_service import call_llm
import logging

logger = logging.getLogger(__name__)


class ExerciseGenerator:

    async def generate_exercise(self, request: ExerciseRequest) -> ExerciseResponse:
        prompt = f"""Génère un exercice de programmation sur : {request.topic} (niveau {request.level}).

STRUCTURE OBLIGATOIRE — sépare l'exercice avec le marqueur exact ===SOLUTION=== sur une ligne seule :

PARTIE 1 (avant le marqueur) — L'ÉNONCÉ :
- Titre de l'exercice
- Contexte et problème
- Contraintes et exemples d'entrée/sortie

===SOLUTION===

PARTIE 2 (après le marqueur) — LA SOLUTION :
- Solution complète commentée avec blocs de code
- Explications détaillées pas à pas

Format markdown avec blocs de code."""

        messages = [
            {"role": "system", "content": "Tu es un professeur d'informatique. Génère des exercices pédagogiques en markdown."},
            {"role": "user", "content": prompt}
        ]

        try:
            content = await call_llm(messages, max_tokens=2048)
            return ExerciseResponse(content=content)
        except Exception as e:
            logger.error(f"[Exercise] Erreur: {e}")
            return ExerciseResponse(content=f"Erreur lors de la génération: {str(e)}")