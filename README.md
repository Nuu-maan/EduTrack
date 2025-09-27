# EduTrack · Student Management System

[![Made with FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

EduTrack is a full‑stack app for schools to track attendance, marks, and generate rich reports. Backend is powered by FastAPI; frontend by Next.js App Router with a modern, accessible UI.

• Frontend: `frontend/` (Next.js + Tailwind + shadcn/ui + Recharts)

• Backend: `backend/` (FastAPI + SQLAlchemy + JWT)

Quick links: [Getting Started](#-quick-start) · [Development](#-development-setup) · [Project Structure](#-project-structure) · [API](#-api-endpoints)  · [License](#-license)

## Table of contents

1. Overview and Features
2. Architecture
3. Project Structure
4. Quick Start (Docker)
5. Development Setup (Backend/Frontend)
6. Environment Variables
7. API Endpoints
8. Contributing and License

## 🏗️ Architecture

```mermaid
flowchart LR
  subgraph Client[Web Client]
    UI[Next.js 14 App Router Tailwind + shadcn/ui Recharts]
  end

  subgraph Server[Backend API]
    API[FastAPI Routers: auth, students, attendance, marks, reports]
    DB[(SQLite/PostgreSQL)]
  end

  UI <-->|Axios REST| API
  API --> DB
  DB --> API
```

## 🚀 Features

### Backend Features
- **JWT Authentication**: Secure teacher login and registration
- **Student Management**: CRUD operations for student records
- **Attendance Tracking**: Daily attendance marking and monitoring
- **Marks Management**: Add and track student performance
- **Reports Generation**: Comprehensive student performance reports
- **Database Support**: SQLite (default) with easy PostgreSQL migration

### Frontend Features
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Dashboard**: Overview of key metrics and quick actions
- **Student Management**: Add, edit, delete student records
- **Attendance System**: Mark and view daily attendance
- **Marks Tracking**: Record and monitor student performance
- **Interactive Reports**: Charts and visualizations using Recharts
- **Authentication**: Secure login/logout with JWT tokens

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: Python SQL toolkit and ORM
- **SQLite/PostgreSQL**: Database support
- **JWT**: JSON Web Token authentication
- **Pydantic**: Data validation using Python type annotations

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Recharts**: Composable charting library
- **Lucide React**: Beautiful icons

### Deployment
- **Docker**: Containerization for both frontend and backend
- **Docker Compose**: Multi-container application orchestration

## 📁 Project Structure

```
edutrack/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── database.py             # DB engine/session
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── crud.py                 # DB operations
│   │   └── routers/
│   │       ├── auth.py             # Auth endpoints
│   │       ├── students.py         # Students CRUD
│   │       ├── attendance.py       # Attendance API
│   │       ├── marks.py            # Marks API
│   │       └── reports.py          # Reports API
│   ├── requirements.txt            # Python deps
│   └── Dockerfile                  # Backend container
│
├── frontend/
│   ├── app/                        # Next.js App Router pages
│   ├── components/                 # UI and shared comps
│   ├── contexts/                   # React contexts
│   ├── hooks/                      # Custom hooks
│   ├── lib/                        # API client, utils, types
│   ├── public/                     # Public assets
│   ├── styles/                     # Global CSS (if any)
│   ├── package.json                # Node deps
│   └── next.config.mjs             # Next config
│
├── docker-compose.yml              # (optional) Compose setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nuu-maan/EduTrack.git
   cd edutrack
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### First Time Setup

1. **Register a teacher account**
   - Go to http://localhost:3000/login
   - Click "Sign up" to create a new account
   - Use your credentials to log in

2. **Add students**
   - Navigate to the Students page
   - Click "Add Student" to create student records

3. **Start tracking**
   - Mark daily attendance in the Attendance page
   - Add marks in the Marks page
   - Generate reports in the Reports page

## 🔧 Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

Common scripts (frontend)

```
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run start      # Start production server
```

## 🗄️ Database Configuration

### SQLite (Default)
The application uses SQLite by default, which requires no additional setup.

### PostgreSQL (Optional)
To use PostgreSQL instead of SQLite:

1. **Uncomment PostgreSQL service in docker-compose.yml**
2. **Update DATABASE_URL in backend environment**
3. **Restart the application**

```yaml
# In docker-compose.yml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: edutrack
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new teacher
- `POST /auth/login` - Teacher login
- `GET /auth/me` - Get current user info

### Students
- `GET /students/` - Get all students
- `GET /students/{id}` - Get student by ID
- `POST /students/` - Create new student
- `PUT /students/{id}` - Update student
- `DELETE /students/{id}` - Delete student

### Attendance
- `GET /attendance/student/{id}` - Get student attendance
- `GET /attendance/date/{date}` - Get attendance by date
- `POST /attendance/` - Mark attendance
- `POST /attendance/bulk` - Mark bulk attendance

### Marks
- `GET /marks/student/{id}` - Get student marks
- `GET /marks/student/{id}/subject/{subject}` - Get marks by subject
- `POST /marks/` - Add marks
- `POST /marks/bulk` - Add bulk marks

### Reports
- `GET /reports/student/{id}` - Get student report
- `GET /reports/class/{class}/attendance` - Get class attendance summary
- `GET /reports/class/{class}/marks` - Get class marks summary

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **CORS Protection**: Configured for frontend domain
- **Input Validation**: Pydantic schema validation
- **SQL Injection Protection**: SQLAlchemy ORM protection

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection
- **Interactive Charts**: Performance visualization
- **Real-time Updates**: Live data updates
- **Intuitive Navigation**: Easy-to-use interface

## 🚀 Deployment

### Production Deployment

1. **Update environment variables**
   ```bash
   # For production, update these in docker-compose.yml
   - DATABASE_URL=postgresql://user:password@postgres:5432/edutrack
   - NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./edutrack.db` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-change-in-production` |

Backend `.env` example

```
DATABASE_URL=sqlite:///./edutrack.db
SECRET_KEY=change-me
```

Frontend `.env.local` example

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/edutrack/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Email notifications for attendance
- [ ] Parent portal access
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-school support
- [ ] Integration with external systems

---

**EduTrack** - Empowering education through technology 📚✨
