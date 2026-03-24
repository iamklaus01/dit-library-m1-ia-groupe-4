from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from .database import Base

class Book(Base):
    __tablename__ = "books"

    id               = Column(Integer, primary_key=True, index=True)
    title            = Column(String, nullable=False)
    author           = Column(String, nullable=False)
    isbn             = Column(String, unique=True, nullable=False)
    category         = Column(String, nullable=True)
    total_copies     = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    published_at     = Column(Date, nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())