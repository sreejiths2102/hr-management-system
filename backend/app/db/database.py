from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os
import socket

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    try:
        parsed_url = make_url(DATABASE_URL)
        if parsed_url.host:
            socket.gethostbyname(parsed_url.host)
        engine = create_engine(DATABASE_URL)
    except Exception as exc:  # noqa: BLE001
        fallback_db = Path(__file__).resolve().parents[2] / "hrms.sqlite3"
        engine = create_engine(f"sqlite:///{fallback_db}", connect_args={"check_same_thread": False})
else:
    fallback_db = Path(__file__).resolve().parents[2] / "hrms.sqlite3"
    engine = create_engine(f"sqlite:///{fallback_db}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()