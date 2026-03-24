from fastapi import FastAPI
from .routes import book_router, tag_router

app = FastAPI(
    title="Books Service",
    description="Microservice de gestion des livres - DIT Library",
    version="1.0.0"
)

app.include_router(tag_router)
app.include_router(book_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "books-service"}