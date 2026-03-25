from fastapi import FastAPI
from .routes import router


app = FastAPI(
    title="Users Service",
    description="Microservice de gestion des utilisateurs - Librairie DIT",
    version="1.0.0"
)

# Pour enregistrer les routes
app.include_router(router)

# Pour vérifier que tout est ok
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "users-service"}