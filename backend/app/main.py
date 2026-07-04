from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.attendance import router as attendance_router
from app.api.company import router as company_router
from app.api.dashboard import router as dashboard_router
from app.api.payroll import router as payroll_router
from app.api.users import router as users_router
from app.api.leave import router as leave_router
from app.db.database import Base, engine
from app.models.attendance import Attendance
from app.models.company import Company
from app.models.leave_request import LeaveRequest
from app.models.salary import Salary
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5174", "http://localhost:5174", "http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(attendance_router)
app.include_router(company_router)
app.include_router(dashboard_router)
app.include_router(payroll_router)
app.include_router(users_router)
app.include_router(leave_router)

@app.get("/")
def home():
    return {"message": "HRMS Running"}