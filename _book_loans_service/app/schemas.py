from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from .models import LoanStatus

class LoanBase(BaseModel):
    book_id : int
    user_id : UUID
    due_date : date

class LoanCreate(BaseModel):
    book_id : int
    user_id : UUID
    due_date : Optional[date] = None

class LoanResponse(BaseModel):
    id : UUID
    book_id : int
    user_id : UUID
    loan_date : date
    due_date : date
    return_date : Optional[date] = None
    status : LoanStatus
    created_at : datetime

    class Config:
        from_attributes = True