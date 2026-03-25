from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import get_db
from .auth import get_current_user, require_role

router = APIRouter()

# Gestion des catgéories

tag_router = APIRouter(prefix="/categories", tags=["Categories"])

@tag_router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    return db.query(models.BookCategory).all()

@tag_router.post("/", response_model=schemas.CategoryResponse, status_code=201)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    existing = db.query(models.BookCategory).filter(
        models.BookCategory.name == category.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Catégorie déjà existante")
    db_category = models.BookCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@tag_router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    db_category = db.query(models.BookCategory).filter(
        models.BookCategory.id == category_id
    ).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Catégorie non retrouvée")
    db.delete(db_category)
    db.commit()
    return None

# Route pour gestion de livres

book_router = APIRouter(prefix="/books", tags=["books"])

@book_router.get("/", response_model=List[schemas.BookResponse])
def get_books(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    return db.query(models.Book).all()

@book_router.get("/search/", response_model=List[schemas.BookResponse])
def search_books(
    title: str = None,
    author: str = None,
    isbn: str = None,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    query = db.query(models.Book)
    if title:
        query = query.filter(models.Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if isbn:
        query = query.filter(models.Book.isbn == isbn)
    return query.all()

@book_router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non retrouvé")
    return book

@book_router.post("/", response_model=schemas.BookResponse, status_code=201)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    existing = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if existing:
        raise HTTPException(status_code=400, detail="ISBN déjà existant")
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@book_router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(
    book_id: int,
    book: schemas.BookUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Livre non retrouvé")
    update_data = book.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)
    db.commit()
    db.refresh(db_book)
    return db_book

@book_router.delete("/{book_id}", status_code=204)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("Personnel administratif"))
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Livre non retrouvé")
    db.delete(db_book)
    db.commit()
    return None