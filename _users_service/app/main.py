from fastapi import FastAPI
from .routes import router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Users Service",
    description="Microservice de gestion des utilisateurs - Librairie DIT",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pour enregistrer les routes
app.include_router(router)

# Pour vérifier que tout est ok
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "users-service"}