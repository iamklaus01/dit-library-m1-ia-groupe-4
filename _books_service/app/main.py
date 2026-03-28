from fastapi import FastAPI
from .routes import book_router, tag_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Books Service",
    description="Microservice de gestion des livres - DIT Library",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tag_router)
app.include_router(book_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "books-service"}