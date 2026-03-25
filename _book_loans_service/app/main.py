from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="Book Loans Service",
    description="Microservice de gestion des emprunts - DIT Library",
    version="1.0.0"
)

app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "book-loans-service"}