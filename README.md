# Human Resource Management System (HRMS)

A modern Human Resource Management System (HRMS) developed to streamline employee management, attendance tracking, leave management, and payroll administration within an organization. The system provides separate interfaces for HR personnel and employees with role-based access control.

---

## Overview

This application simplifies HR operations by providing a centralized platform for managing employees, attendance, leave requests, and payroll. It follows a role-based architecture where HR personnel manage organizational operations while employees can access and manage their own information.

---

## Features

### Company Registration
- One-time company registration
- Automatic company code generation
- First HR created as Company Admin
- Company logo upload

### Authentication
- Secure Login using Login ID
- JWT-based authentication
- Role-based authorization
- First-time password change support

### HR Management
- Dashboard with employee overview
- Add/Edit/Delete Employees
- Add additional HR users
- Employee search and filtering
- Company settings (Company Admin)

### Employee Management
- Employee profile management
- View personal details
- Update allowed profile information
- Profile picture support

### Attendance Management
- Employee Check-In / Check-Out
- Working hours calculation
- Attendance history
- Attendance overview for HR

### Leave Management
- Apply for leave
- Leave approval/rejection by HR
- Automatic attendance update after leave approval
- Leave history tracking

### Payroll
- Payroll management for HR
- Salary structure management
- Employee payroll view
- Automatic salary calculations

### Dashboard
#### HR Dashboard
- Employee directory
- Attendance summary
- Pending leave requests
- Quick management tools

#### Employee Dashboard
- Profile
- Attendance
- Leave Requests
- Payroll
- Recent Activity

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- Passlib (Password Hashing)

### Database
- PostgreSQL

---

## Project Structure

```
HRMS
│
├── backend
│   ├── api
│   ├── models
│   ├── schemas
│   ├── db
│   ├── core
│   └── services
│
└── frontend
    ├── components
    ├── pages
    ├── layouts
    ├── services
    ├── hooks
    └── routes
```

---

## User Roles

### Company Admin
- Register company
- Manage company settings
- Add and manage HR users
- Manage employees
- Attendance management
- Leave approvals
- Payroll management

### HR
- Manage employees
- Attendance management
- Leave approvals
- Payroll management
- Reports

### Employee
- View and update profile
- Check-In / Check-Out
- Apply for leave
- View attendance
- View payroll

---

## Workflow

```
Company Registration
        │
        ▼
Create First HR (Company Admin)
        │
        ▼
Login
        │
 ┌──────┴──────┐
 │             │
 ▼             ▼
HR Dashboard  Employee Dashboard
```

---

## Future Enhancements

- Email notifications
- Employee document management
- Performance evaluation
- Holiday calendar
- Analytics dashboard
- Mobile application
- Multi-company support

---

## Contributors

- Sreejith S
- Joyal
- Angeleena
- Sheharba

---

## License

This project was developed for educational and hackathon purposes.