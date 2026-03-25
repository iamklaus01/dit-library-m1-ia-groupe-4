from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base
import uuid

import enum
from sqlalchemy import Enum as SAEnum

class LoanStatus(enum.Enum):
    EN_COURS  = "En cours"
    RETOURNE  = "Retourné"
    EN_RETARD = "En Retard"

class Loan(Base):
    __tablename__ = "loans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(Integer, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    loan_date = Column(Date, nullable=False, server_default=func.current_date())
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    status = Column(SAEnum(LoanStatus), nullable=False, default=LoanStatus.EN_COURS)
    created_at = Column(DateTime(timezone=True), server_default=func.now())