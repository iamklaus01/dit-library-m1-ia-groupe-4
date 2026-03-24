from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class BookCategory(Base):
    __tablename__ = "book_categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relation vers les livres
    books = relationship("Book", back_populates="category")


class Book(Base):
    __tablename__ = "books"

    id               = Column(Integer, primary_key=True, index=True)
    title            = Column(String, nullable=False)
    author           = Column(String, nullable=False)
    isbn             = Column(String, unique=True, nullable=False)
    category_id      = Column(Integer, ForeignKey("book_categories.id"), nullable=True)
    total_copies     = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    published_at     = Column(Date, nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    # Relation vers la categorie
    category = relationship("BookCategory", back_populates="books")