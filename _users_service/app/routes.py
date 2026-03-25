from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from . import models, schemas
from .database import get_db
from .auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)
from .models import RoleEnum

router = APIRouter(prefix="/users", tags=["users"])

# Route d'authentification

@router.post("/login", response_model=schemas.Token)
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.username).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Les identifiants de connexion sont incorrects")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}


# Route pour gérer le profil utilisateur

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_me(
    user: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = user.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password", status_code=200)
def update_password(
    data: schemas.PasswordUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Le précédent mot de passe est incorrect")
    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Votre mot de passe a été mis à jour avec succès"}


# Routes pour gérer les utilisateurs par le personnel administratif

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(RoleEnum.STAFF))
):
    return db.query(models.User).all()


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(RoleEnum.STAFF))
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    return user


@router.post("/", response_model=schemas.UserResponse, status_code=201)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(RoleEnum.STAFF))
):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email deja utilise")
    user_data = user.model_dump()
    user_data["password"] = hash_password(user_data["password"])
    db_user = models.User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: UUID,
    data: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(RoleEnum.STAFF))
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non retrouvé")
    db_user.role = data.role
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}/reset-password", status_code=200)
def reset_user_password(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(RoleEnum.STAFF))
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non retrouvé")
    
    # Mot de passe par défaut = les 8 premiers caractères de l'UUID
    new_password = str(user_id)[:8]
    db_user.password = hash_password(new_password)
    db.commit()
    return {"message": "Mot de passe reinitialisé", "new_password": new_password}


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(RoleEnum.STAFF))
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non retrouvé")
    db.delete(db_user)
    db.commit()
    return None