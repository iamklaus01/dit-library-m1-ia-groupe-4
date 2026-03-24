from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import get_db


router = APIRouter(prefix="/books", tags=["books"])

# Obtenir la liste de tous les livres enregsitres
@router.get("/", response_model=List[schemas.BookResponse])
def get_books(db: Session = Depends(get_db)):
    books = db.query(models.Book).all()
    return books

# Obtenir un livre à partir de son id
@router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Livre non trouve")
    return book

# Obtenir un livre à partir de son titre, de son auteur, de l'isbn
@router.get("/search/", response_model=List[schemas.BookResponse])
def search_books(
    title : str = None,
    author: str = None,
    isbn  : str = None,
    db    : Session = Depends(get_db)
):
    query = db.query(models.Book)

    if isbn:
        query = query.filter(models.Book.isbn == isbn)
    if title:
        query = query.filter(models.Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    
    results = query.all()
    return results


# Methode pour creer un livre
@router.post("/", response_model=schemas.BookResponse, status_code=201)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):

    # Verifier si l'ISBN existe dejà
    existing = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un livre avec le meme ISBN existe deja !")

    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


# Methode pour modifier un livre
@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Le livre que vous essayez de modifier ne semble pas etre enregistre dans la base.")

    # Mise à jours des champs rensignes uniquement
    update_data = book.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)

    db.commit()
    db.refresh(db_book)
    return db_book

# Methode pour supprimer un livre
@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Le livre que vous essayez de supprimer ne pas semble etre enregistre dans la base.")

    db.delete(db_book)
    db.commit()
    return None