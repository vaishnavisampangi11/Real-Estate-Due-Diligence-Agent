# Testing & Quality Assurance Guide

## 1. Test Suite Architecture

The automated test suite combines unit tests, Mockito component tests, security filter verification, and Spring Boot integration tests.

### 1.1 Backend Test Directory Structure
```text
backend/src/test/java/com/realestate/agent/
├── RealEstateDueDiligenceAgentApplicationTests.java  (Spring Boot Context Load)
├── controller/
│   ├── AuthControllerTest.java                       (MockMvc auth endpoint tests)
│   └── PropertyControllerTest.java                   (MockMvc property retrieval & search tests)
├── security/
│   └── SecurityEntryPointTest.java                   (401 & 403 response payload tests)
└── service/
    ├── AuthServiceTest.java                          (User registration & login logic)
    ├── PropertyServiceTest.java                      (Property creation & batch search)
    ├── RiskServiceTest.java                          (Risk calculation & assessment retrieval)
    ├── ReportServiceTest.java                        (Audit report generation & export)
    ├── NotificationServiceTest.java                  (Notification inbox & read counts)
    └── AuditLogServiceTest.java                      (Security audit logging)
```

---

## 2. Test Execution Commands

### 2.1 Backend Tests
Execute within the `backend/` directory:
```powershell
.\mvnw.cmd clean test
```
* **Expected Result**: `BUILD SUCCESS` (32 tests passing, 0 failures, 0 errors).

### 2.2 Frontend Build & Compilation Check
Execute within the `frontend/real-estate-frontend/` directory:
```powershell
npm run build
```
* **Expected Result**: `dist/` production bundle compiled cleanly with 0 TypeScript/JSX errors.

---

## 3. End-to-End Test Matrix

| Phase | Flow | Verification Point |
| :--- | :--- | :--- |
| **Auth** | Registration & Login | JWT token issuance, password BCrypt hashing, role assignment |
| **Search** | Property Catalog Search | Multi-param filtering (`city`, `type`, `price`), pagination, batch address lookup |
| **Details** | 360° Property View | Title deeds, tax history, zoning FAR, flood zone, permits, utilities |
| **Risk** | Risk Assessment Module | 13-vector risk breakdown, confidence score, recommendation badge |
| **Reports** | Report Generation | PDF binary stream export (`.pdf`), Excel spreadsheet export (`.xlsx`) |
| **Governance**| Admin & Audit Logs | Real-time audit activity feed recording property registrations & reviews |
| **Resilience**| Backend OFF / ON | Immediate error banner on network failure; 0 mock property fallbacks |
