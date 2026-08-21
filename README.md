# Real Estate Due Diligence Agent Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![Java](https://img.shields.io/badge/Java-21%2B-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.16-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F18-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

An enterprise-grade, multi-tier automated Due Diligence platform for real estate investments and property acquisitions in India. The platform integrates property discovery, public registry verification (Title, Tax, Zoning, Flood, Environmental, Permits, Utilities), automated risk scoring, multi-role workspaces, and official audit certificate generation (PDF/Excel).

---

## 🏗️ Architecture & Technology Stack

```text
PostgreSQL Database (Port 5432)
              │
              ▼
Spring Boot Backend REST APIs (Port 8081)
              │
              ▼
React 18 + Vite Frontend (Port 5174 / 80)
```

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, SweetAlert2, Framer Motion
* **Backend**: Java 21, Spring Boot 3.5.16, Spring Security, JWT (HMAC-SHA256), Spring Data JPA, Hibernate ORM
* **Database**: PostgreSQL 16/18 with B-Tree indexing and relational integrity constraints
* **Containerization**: Multi-stage Dockerfiles + Docker Compose

---

## 🚀 Getting Started

### Option A: Local Full-Stack Docker Compose (Recommended)
```bash
# Clone and enter project directory
cd realstate/Real_Estate_Due_Diligence_Agent

# Build and start PostgreSQL, Spring Boot, and React via Docker
docker compose up --build -d

# Open frontend in your browser
http://localhost:5174
```

### Option B: Local Developer Mode
1. **Start PostgreSQL**: Ensure service is active on port `5432` with database `real_estate_due_diligence`.
2. **Start Backend**:
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   *Backend runs on `http://localhost:8081`.*
3. **Start Frontend**:
   ```powershell
   cd frontend/real-estate-frontend
   npm install
   npm run dev
   ```
   *Frontend runs on `http://localhost:5174`.*

---

## 📚 Technical Documentation Suite

* [System Architecture Specification](docs/ARCHITECTURE.md)
* [REST API Reference & OpenAPI Endpoints](docs/API_DOCUMENTATION.md)
* [Database Schema & Entity Relationship Manual](docs/DATABASE_MANUAL.md)
* [Testing & Quality Assurance Guide](docs/TESTING_GUIDE.md)
* [Deployment & Cloud Containerization Guide](docs/DEPLOYMENT_GUIDE.md)
* [User Manual & Operational Workflows](docs/USER_MANUAL.md)

---

## 🧪 Testing & Verification

```powershell
# Run backend test suite (32 unit & integration tests)
cd backend
.\mvnw.cmd clean test

# Run frontend production build
cd frontend/real-estate-frontend
npm run build
```

---

## 🔒 Security & Data Integrity Highlights

* **Zero Mock Property Data in Production**: 100% of property, tax, zoning, and risk data originates from PostgreSQL and backend REST APIs.
* **Resilient Error Handling**: Automatic fallback to loading/error banners on network failures; zero fake data fallbacks.
* **N+1 Database Query Optimization**: Property search queries utilize batch lookups, reducing page query overhead from 101 to 3 SQL queries.
* **Stateless JWT Security**: BCrypt password hashing, role-based endpoint authorization (`@PreAuthorize`), and strict CORS origin validation.
