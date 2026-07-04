from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.salary import Salary
from app.services.salary_service import calculate_salary_components

def seed_database():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        print("Seeding database...")

        # 1. Create a Company
        company = Company(
            company_name="Angeleena Tech",
            company_code="ANG",
            logo=None
        )
        db.add(company)
        db.flush()  # to get company.id

        company_id = company.id

        # 2. Create HR Admin User
        hr_admin = User(
            company_id=company_id,
            employee_id="ANG0001",
            login_id="ANG-hr-1",
            name="Angeleena Admin",
            email="hr@angeleena.com",
            phone="+1234567890",
            password=hash_password("Password123"),
            role="hr",
            is_company_admin=True,
            department="Human Resources",
            designation="HR Director",
            joining_date=date(2025, 1, 15),
            salary=8500.0,
            address="100 HR Parkway, Metro City",
            must_change_password=False,
            is_active=True
        )
        db.add(hr_admin)

        # 3. Create Employees
        employees_data = [
            {
                "employee_id": "ANG0002",
                "login_id": "ANG-john-2",
                "name": "John Doe",
                "email": "john.doe@angeleena.com",
                "phone": "+1234567891",
                "role": "employee",
                "department": "Engineering",
                "designation": "Senior Frontend Developer",
                "joining_date": date(2025, 3, 1),
                "salary": 6500.0,
                "address": "123 Main St, Springfield",
            },
            {
                "employee_id": "ANG0003",
                "login_id": "ANG-jane-3",
                "name": "Jane Smith",
                "email": "jane.smith@angeleena.com",
                "phone": "+1234567892",
                "role": "employee",
                "department": "Engineering",
                "designation": "Backend Engineer",
                "joining_date": date(2025, 4, 15),
                "salary": 6000.0,
                "address": "456 Oak Rd, Springfield",
            },
            {
                "employee_id": "ANG0004",
                "login_id": "ANG-bob-4",
                "name": "Bob Johnson",
                "email": "bob.johnson@angeleena.com",
                "phone": "+1234567893",
                "role": "employee",
                "department": "Marketing",
                "designation": "Marketing Lead",
                "joining_date": date(2025, 5, 10),
                "salary": 5000.0,
                "address": "789 Pine Ave, Metro City",
            },
            {
                "employee_id": "ANG0005",
                "login_id": "ANG-alice-5",
                "name": "Alice Williams",
                "email": "alice.williams@angeleena.com",
                "phone": "+1234567894",
                "role": "employee",
                "department": "Sales",
                "designation": "Sales Executive",
                "joining_date": date(2025, 6, 20),
                "salary": 4500.0,
                "address": "321 Cedar Blvd, Metro City",
            }
        ]

        seeded_employees = []
        for emp_data in employees_data:
            emp = User(
                company_id=company_id,
                password=hash_password("Password123"),
                is_company_admin=False,
                must_change_password=True,
                is_active=True,
                **emp_data
            )
            db.add(emp)
            seeded_employees.append(emp)
        
        db.flush()

        # 4. Create Attendance Logs (Past 5 days for each employee)
        today = date.today()
        # John is present, Jane is present, Bob is absent, Alice is on leave
        # Let's seed attendance logs for the past 5 days
        for day_offset in range(1, 6):
            target_date = today - timedelta(days=day_offset)
            # Skip weekends for realistic logs
            if target_date.weekday() >= 5:
                continue

            for emp in seeded_employees:
                # Engineering employees are present, Bob is sometimes absent, Alice present
                status = "Present"
                if emp.name == "Bob Johnson" and day_offset == 2:
                    status = "Absent"
                
                check_in = None
                check_out = None
                working_minutes = None

                if status == "Present":
                    # Check in around 9:00 AM UTC
                    check_in = datetime.combine(target_date, datetime.min.time()) + timedelta(hours=9, minutes=15)
                    # Check out around 5:30 PM UTC
                    check_out = check_in + timedelta(hours=8, minutes=30)
                    working_minutes = 510

                attendance = Attendance(
                    user_id=emp.id,
                    date=target_date,
                    check_in=check_in,
                    check_out=check_out,
                    working_minutes=working_minutes,
                    status=status,
                    remarks="Automatic Seed"
                )
                db.add(attendance)

        # Seed today's attendance: John and Jane are present (checked in), Bob is absent, Alice is on leave
        # John checked in today:
        john = seeded_employees[0]
        john_attendance = Attendance(
            user_id=john.id,
            date=today,
            check_in=datetime.now(timezone.utc) - timedelta(hours=6),
            check_out=None,
            working_minutes=None,
            status="Present",
            remarks="Check In Seed"
        )
        db.add(john_attendance)

        # Jane checked in and checked out today:
        jane = seeded_employees[1]
        jane_attendance = Attendance(
            user_id=jane.id,
            date=today,
            check_in=datetime.now(timezone.utc) - timedelta(hours=5),
            check_out=datetime.now(timezone.utc) - timedelta(minutes=30),
            working_minutes=270,
            status="Present",
            remarks="Checked Out Seed"
        )
        db.add(jane_attendance)

        # 5. Create Leave Requests
        # Leave request for Alice (Approved, covering today)
        alice = seeded_employees[3]
        alice_leave = LeaveRequest(
            user_id=alice.id,
            leave_type="Sick Leave",
            start_date=today - timedelta(days=1),
            end_date=today + timedelta(days=2),
            reason="Recovering from fever",
            status="Approved",
            approved_by=hr_admin.id,
            admin_comment="Get well soon!",
            applied_at=datetime.now(timezone.utc) - timedelta(days=3),
            decision_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(alice_leave)
        
        # Mark Alice's attendance today as Leave
        alice_attendance_today = Attendance(
            user_id=alice.id,
            date=today,
            check_in=None,
            check_out=None,
            working_minutes=None,
            status="Leave",
            remarks="Sick Leave"
        )
        db.add(alice_attendance_today)

        # Pending Leave Request from Bob
        bob = seeded_employees[2]
        bob_leave = LeaveRequest(
            user_id=bob.id,
            leave_type="Casual Leave",
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=7),
            reason="Family gathering",
            status="Pending",
            applied_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(bob_leave)

        # Rejected Leave Request from John
        john_old_leave = LeaveRequest(
            user_id=john.id,
            leave_type="Casual Leave",
            start_date=today - timedelta(days=10),
            end_date=today - timedelta(days=8),
            reason="Personal work",
            status="Rejected",
            approved_by=hr_admin.id,
            admin_comment="Critical release schedule. Please reschedule.",
            applied_at=datetime.now(timezone.utc) - timedelta(days=15),
            decision_at=datetime.now(timezone.utc) - timedelta(days=14)
        )
        db.add(john_old_leave)

        # 6. Create Payroll / Salary Records (For June 2026)
        current_year_month = "2026-06"
        for emp in seeded_employees:
            components = calculate_salary_components(emp.salary)
            salary_record = Salary(
                user_id=emp.id,
                month=current_year_month,
                **components
            )
            db.add(salary_record)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
