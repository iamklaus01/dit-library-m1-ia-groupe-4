from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date, timedelta
import httpx
import os

from . import models, schemas
from .database import get_db
from .auth import get_current_user, require_role, oauth2_scheme
from .models import LoanStatus

router = APIRouter(prefix="/loans", tags=["loans"])

BOOKS_SERVICE_URL = os.getenv("BOOKS_SERVICE_URL", "http://localhost:8001")
USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://localhost:8002")

# Helpers

def verify_book_available(book_id: int, token: str) -> dict:
    """Vérifie que le livre existe et est disponible via books-service"""
    try:
        response = httpx.get(
            f"{BOOKS_SERVICE_URL}/books/{book_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5.0
        )
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Livre non retrouvé")
        book = response.json()
        if book["available_copies"] <= 0:
            raise HTTPException(status_code=400, detail="Aucun exemplaire disponible")
        return book
    except httpx.TimeoutException:
        raise HTTPException(status_code=503, detail="Books service indisponible")


def verify_user_exists(user_id: UUID, token: str) -> dict:
    """Vérifie que l'utilisateur existe via users-service"""
    try:
        response = httpx.get(
            f"{USERS_SERVICE_URL}/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5.0
        )
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Utilisateur non retrouvé")
        return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=503, detail="Users service indisponible")


def update_book_copies(book_id: int, delta: int, token: str):
    """Met à jour le nombre d'exemplaires disponibles"""
    try:
        book_response = httpx.get(
            f"{BOOKS_SERVICE_URL}/books/{book_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5.0
        )
        book = book_response.json()
        new_available = book["available_copies"] + delta
        httpx.put(
            f"{BOOKS_SERVICE_URL}/books/{book_id}",
            json={"available_copies": new_available},
            headers={"Authorization": f"Bearer {token}"},
            timeout=5.0
        )
    except httpx.TimeoutException:
        raise HTTPException(status_code=503, detail="Books service indisponible")

# Routes

# Lister tous les emprunts (Personnel administratif seulement)
@router.get("/", response_model=List[schemas.LoanResponse])
def get_loans(
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    return db.query(models.Loan).all()


# Lister les emprunts de l'utilisateur connecté
@router.get("/me", response_model=List[schemas.LoanResponse])
def get_my_loans(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(models.Loan).filter(
        models.Loan.user_id == current_user["user_id"]
    ).all()


# Voir un emprunt
@router.get("/{loan_id}", response_model=schemas.LoanResponse)
def get_loan(
    loan_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Emprunt non retrouvé")
    # Un user ne peut voir que ses propres emprunts
    if current_user["role"] != "Personnel administratif":
        if str(loan.user_id) != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Acces non autorisé")
    return loan


# Enregistrer un emprunt (Personnel adminsitrauf seulement)
@router.post("/", response_model=schemas.LoanResponse, status_code=201)
def create_loan(
    loan: schemas.LoanCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("Personnel administratif")),
    token: str = Depends(oauth2_scheme)
):
    verify_book_available(loan.book_id, token)
    verify_user_exists(loan.user_id, token)

    due_date = loan.due_date or (date.today() + timedelta(days=15))

    db_loan = models.Loan(
        book_id   = loan.book_id,
        user_id   = loan.user_id,
        due_date  = due_date,
        loan_date = date.today(),
        status    = LoanStatus.EN_COURS
    )
    db.add(db_loan)
    update_book_copies(loan.book_id, -1, token)
    db.commit()
    db.refresh(db_loan)
    return db_loan



# Marquer la ifn d'eun emprunt (Personnel administratif seulement)
@router.put("/{loan_id}/return", response_model=schemas.LoanResponse)
def return_loan(
    loan_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("Personnel administratif")),
    token: str = Depends(oauth2_scheme)
):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Emprunt non retrouvé")
    if loan.status == LoanStatus.RETOURNE:
        raise HTTPException(status_code=400, detail="Livre deja retourne")

    loan.return_date = date.today()
    loan.status = LoanStatus.RETOURNE
    update_book_copies(loan.book_id, +1, token)
    db.commit()
    db.refresh(loan)
    return loan


# Détecter les retards (automatique)
@router.post("/check-overdue", status_code=200)
def check_overdue(
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    today = date.today()
    overdue_loans = db.query(models.Loan).filter(
        models.Loan.status == LoanStatus.EN_COURS,
        models.Loan.due_date < today
    ).all()

    count = 0
    for loan in overdue_loans:
        loan.status = LoanStatus.EN_RETARD
        count += 1

    db.commit()
    return {"message": f"{count} emprunt(s) mis en retard"}