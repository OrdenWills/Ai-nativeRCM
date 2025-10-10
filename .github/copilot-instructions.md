# AI-native RCM Platform Development Guide

This guide helps AI agents understand the key architecture, patterns, and workflows of this Revenue Cycle Management (RCM) platform.

## Project Architecture

### Backend (`/backend`)
- Flask-based REST API with modular blueprints for different RCM domains
- SQLAlchemy ORM with SQLite database (configurable for PostgreSQL in production)
- Key modules:
  - Authentication (`routes/auth.py`)
  - Claims Processing (`routes/claims.py`)
  - Medical Coding (`routes/medical_coding.py`)
  - Eligibility Verification (`routes/eligibility.py`)
  - Prior Authorization (`routes/prior_auth.py`)
  - Clinical Documentation (`routes/clinical_docs.py`)
  - Remittance Processing (`routes/remittance.py`)
  - Dashboard Analytics (`routes/dashboard.py`)

### Frontend (`/frontend`)
- React SPA with React Router for navigation
- Centralized API service (`src/services/api.js`) with axios interceptors for auth
- Protected routes pattern with authentication state management
- Shared Layout component (`components/Layout`) for consistent UI structure

## Development Workflows

### Environment Setup
1. Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Frontend:
```bash
cd frontend
npm install
```

### Configuration
- Backend uses `.env` for environment variables:
  - `DATABASE_URL`: Database connection string
  - `SECRET_KEY`: JWT signing key
- Frontend uses environment variables:
  - `REACT_APP_API_URL`: Backend API endpoint

## Key Patterns

### API Authentication
- JWT-based authentication with token stored in localStorage
- API requests automatically include Bearer token via axios interceptor
- 401 responses trigger automatic logout and redirect to login page

### Data Flow
- Frontend components make API calls through centralized `apiEndpoints` service
- Backend routes use modular blueprints with consistent error handling
- AI services integration through dedicated `ai_service.py`

### Project-Specific Conventions
1. Route Organization:
   - All routes are prefixed with domain area (e.g., `/claims`, `/eligibility`)
   - Each domain has its own blueprint in `backend/app/routes/`
   - Corresponding frontend pages in `frontend/src/pages/`

2. Error Handling:
   - Backend: Consistent error response format through Flask error handlers
   - Frontend: Axios interceptors for global error handling

## Integration Points
- Google AI integration for medical coding assistance
- Document processing for clinical documentation
- External API integrations for eligibility verification and claims processing

Please request clarification if any aspects need more detail.