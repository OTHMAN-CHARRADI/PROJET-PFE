from pydantic import BaseModel, Field
from typing import List


class QuestionResponse(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_answer: str
    explanation: str = ""


class QuizResponse(BaseModel):
    questions: List[QuestionResponse]


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI response")


class ExerciseResponse(BaseModel):
    content: str = Field(..., description="Exercise content with solution")