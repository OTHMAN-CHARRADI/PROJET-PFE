from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.quiz import router as quiz_router
from app.routes.chat import router as chat_router
from app.routes.exercise import router as exercise_router

app = FastAPI(
    title="PFE AI Service",
    description="AI microservice for quiz, chat, and exercise generation",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz_router, prefix="/api", tags=["Quiz AI"])
app.include_router(chat_router, prefix="/api", tags=["Chat AI"])
app.include_router(exercise_router, prefix="/api", tags=["Exercise AI"])


@app.get("/")
async def root():
    return {"message": "PFE AI Service is running", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}