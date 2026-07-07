from fastapi import APIRouter
from app.model.request_models import QuizRequest
from app.model.response_models import QuizResponse
from app.service.quiz_generator import QuizGenerator

router = APIRouter()


@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    generator = QuizGenerator()
    return await generator.generate_quiz(request)