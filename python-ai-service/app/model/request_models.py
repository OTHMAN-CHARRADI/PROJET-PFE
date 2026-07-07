from pydantic import BaseModel, Field
from typing import List, Optional


class QuizRequest(BaseModel):
    topic: str = Field(..., description="Quiz topic")
    level: str = Field("débutant", description="User level")
    num_questions: int = Field(10, gt=0, description="Number of questions")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=0, description="User message")
    level: str = Field("débutant", description="User level")
    conversation_history: Optional[List[dict]] = Field(
        default=None, description="Previous messages [{role, content}]"
    )
    system_prompt: Optional[str] = Field(
        default=None, description="Custom system prompt (overrides the default one)"
    )
    attached_files: Optional[List[str]] = Field(
        default=None, description="List of file URLs joined by the user"
    )


class ExerciseRequest(BaseModel):
    topic: str = Field(..., description="Exercise topic")
    level: str = Field("débutant", description="Difficulty level")