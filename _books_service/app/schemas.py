from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# Schemas pour les categories

class CategoryBase(BaseModel):
    name        : str
    description : Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id         : int
    created_at : datetime

    class Config:
        from_attributes = True

# Schemas pour les livres

class BookBase(BaseModel):
    title            : str
    author           : str
    isbn             : str
    category_id      : Optional[int] = None
    total_copies     : int = 1
    available_copies : int = 1
    published_at     : Optional[date] = None

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title            : Optional[str]  = None
    author           : Optional[str]  = None
    isbn             : Optional[str]  = None
    category_id      : Optional[int]  = None
    total_copies     : Optional[int]  = None
    available_copies : Optional[int]  = None
    published_at     : Optional[date] = None

class BookResponse(BookBase):
    id          : int
    category    : Optional[CategoryResponse] = None
    created_at  : datetime

    class Config:
        from_attributes = True