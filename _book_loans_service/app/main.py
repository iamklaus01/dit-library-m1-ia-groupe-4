from fastapi import FastAPI
from .routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Book Loans Service",
    description="Microservice de gestion des emprunts - DIT Library",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "book-loans-service"}