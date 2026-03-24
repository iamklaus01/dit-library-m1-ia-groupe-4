from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Champs à renseigner pour l'enregistrement d'un livre
class BookBase(BaseModel):
    title           : str
    author          : str
    isbn            : str
    category        : Optional[str] = None
    total_copies    : int = 1
    available_copies: int = 1
    published_at    : Optional[date] = None

# Ce que l'API doit recevoir pour créer un livre
class BookCreate(BookBase):
    pass

# Ce que l'API reçoit pour modifier un livre
class BookUpdate(BaseModel):
    title           : Optional[str] = None
    author          : Optional[str] = None
    isbn            : Optional[str] = None
    category        : Optional[str] = None
    total_copies    : Optional[int] = None
    available_copies: Optional[int] = None
    published_at    : Optional[date] = None

# Ce que l'API renvoie comme réponse
class BookResponse(BookBase):
    id        : int
    created_at: datetime

    class Config:
        from_attributes = True
