import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import os
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env")

from app.database import SessionLocal, engine
from app.models import Base, User, RoleEnum
from app.auth import hash_password
import uuid

def seed():
    db = SessionLocal()
    
    # Vérifie si un admin existe déjà
    existing = db.query(User).filter(User.role == RoleEnum.STAFF).first()
    if existing:
        print("Un utilisateur Personnel existe déjà — seed ignoré.")
        db.close()
        return

    admin = User(
        id=uuid.uuid4(),
        firstname="Admin",
        surname="DIT",
        email="admin@dit.sn",
        password=hash_password("admin2026"),
        role=RoleEnum.STAFF
    )

    db.add(admin)
    db.commit()
    print(f"Utilisateur admin créé — email: admin@dit.sn / password: admin2026")
    db.close()

if __name__ == "__main__":
    seed()