from fastapi import APIRouter
from app.model.request_models import ExerciseRequest
from app.model.response_models import ExerciseResponse
from app.service.exercise_generator import ExerciseGenerator

router = APIRouter()


@router.post("/generate-exercise", response_model=ExerciseResponse)
async def generate_exercise(request: ExerciseRequest):
    generator = ExerciseGenerator()
    return await generator.generate_exercise(request)