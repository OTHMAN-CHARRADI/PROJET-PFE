from app.model.request_models import QuizRequest
from app.model.response_models import QuizResponse, QuestionResponse
from app.service.llm_service import call_llm
import json
import re
import asyncio
import logging

logger = logging.getLogger(__name__)




MAX_TOKENS_PER_QUESTION = 150
SAFETY_MARGIN = 512


class QuizGenerator:

    async def generate_quiz(self, request: QuizRequest) -> QuizResponse:
        max_tokens = request.num_questions * MAX_TOKENS_PER_QUESTION + SAFETY_MARGIN

        prompt = f"""Génère exactement {request.num_questions} questions QCM sur "{request.topic}" en informatique pour un étudiant de niveau {request.level}.

IMPORTANT: Tu DOIS répondre UNIQUEMENT avec du JSON valide. Rien d'autre.

Format EXACT:
{{"questions":[{{"question":"Quelle est la complexité de la recherche binaire ?","options":["A. O(n)","B. O(log n)","C. O(n²)","D. O(1)"],"correct_answer":"B. O(log n)","explanation":"La recherche binaire divise l'espace en deux à chaque étape."}}]}}

Règles:
- Exactement {request.num_questions} questions
- 4 options par question, préfixées A. B. C. D.
- correct_answer = texte EXACT d'une option
- explanation courte (1 phrase max) en français
- JSON pur, SANS markdown ni commentaires"""

        messages = [
            {"role": "system", "content": "Tu génères uniquement du JSON valide, sans aucun texte autour."},
            {"role": "user", "content": prompt}
        ]

        last_error = "Aucune tentative effectuée"

        for attempt in range(3):
            try:
                logger.info(f"[Quiz] Tentative {attempt+1}/3 — topic={request.topic}, max_tokens={max_tokens}")
                raw = await call_llm(messages, max_tokens=max_tokens)
                logger.info(f"[Quiz] Réponse reçue ({len(raw)} chars)")

                text = raw.strip().lstrip('\ufeff')
                text = re.sub(r'^```(?:json)?\s*\n?', '', text)
                text = re.sub(r'\n?```\s*$', '', text).strip()
                match = re.search(r'(\{[\s\S]*\})', text)
                if match:
                    text = match.group(1)
                text = re.sub(r',\s*}', '}', text)
                text = re.sub(r',\s*]', ']', text)

                data = json.loads(text)
                questions = []
                for q in data.get("questions", []):
                    if not isinstance(q, dict) or not q.get("question"):
                        continue
                    opts = q.get("options", [])
                    while len(opts) < 4:
                        opts.append(f"{chr(65+len(opts))}. -")
                    correct = q.get("correct_answer", opts[0])
                    if correct not in opts:
                        prefix = correct[:2] if len(correct) >= 2 else ""
                        matched = [o for o in opts if o.startswith(prefix)]
                        correct = matched[0] if matched else opts[0]
                    questions.append(QuestionResponse(
                        question=q["question"],
                        options=opts[:4],
                        correct_answer=correct,
                        explanation=q.get("explanation", "")
                    ))

                if questions:
                    logger.info(f"[Quiz] ✅ {len(questions)} questions générées")
                    return QuizResponse(questions=questions[:request.num_questions])
                else:
                    last_error = "JSON parsé mais aucune question valide trouvée"
                    logger.warning(f"[Quiz] {last_error}")

            except Exception as e:
                last_error = str(e)
                logger.error(f"[Quiz] ❌ Tentative {attempt+1} échouée: {last_error}")
                if attempt < 2:
                    await asyncio.sleep(1)

        logger.error(f"[Quiz] 3 tentatives épuisées. Dernière erreur: {last_error}")
        return QuizResponse(questions=[QuestionResponse(
            question=f"Erreur: {last_error[:120]}",
            options=["A. Réessayer", "B. Vérifier les logs Python", "C. -", "D. -"],
            correct_answer="A. Réessayer",
            explanation=f"Erreur complète: {last_error}"
        )])