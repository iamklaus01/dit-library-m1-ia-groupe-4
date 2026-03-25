from sqlalchemy import UUID, Column, String, DateTime, Enum
from sqlalchemy.sql import func
from .database import Base
import enum
import uuid

class RoleEnum(enum.Enum):
    STUDENT = "Etudiant"
    STAFF = "Personnel administratif"
    TEACHER = "Professeur"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    surname = Column(String, nullable=False)
    firstname = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.STUDENT)
    password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())