from fastapi import FastAPI
from .database import engine, Base
from .routes import router


app = FastAPI(
    title="Books Service",
    description="Microservice de gestion des livres - Librairie DIT",
    version="1.0.0"
)

# Pour enregistrer les routes
app.include_router(router)

# Pour vérifier que tout est ok
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "books-service"}