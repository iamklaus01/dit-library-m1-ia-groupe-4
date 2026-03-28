from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

from uuid import UUID
from .models import RoleEnum


# Champs à renseigner pour l'enregistrement d'un utilisateur
class UserBase(BaseModel):
    email : str
    firstname : str
    surname : str
    role : RoleEnum

# Ce que l'API doit recevoir pour créer un utilisateur
class UserCreate(UserBase):
    pass

# Ce que l'API reçoit pour modifier un utilisateur
class UserUpdate(BaseModel):
    email : Optional[str] = None
    firstname: Optional[str] = None
    surname  : Optional[str] = None

class UserCreateResponse(BaseModel):
    id         : UUID
    email      : str
    firstname  : str
    surname    : str
    role       : RoleEnum
    created_at : datetime
    generated_password : str

    class Config:
        from_attributes = True
class UserRoleUpdate(BaseModel):
    role : RoleEnum

# Ce que l'API renvoie comme réponse
class UserResponse(BaseModel):
    id         : UUID
    email      : str
    firstname  : str
    surname    : str
    role       : RoleEnum
    created_at : datetime

    class Config:
        from_attributes = True

# Token de connexion
class Token(BaseModel):
    access_token : str
    token_type   : str

# Données de connexion
class LoginRequest(BaseModel):
    username : str
    password : str

# Changement de mot de passe
class PasswordUpdate(BaseModel):
    old_password : str
    new_password : str