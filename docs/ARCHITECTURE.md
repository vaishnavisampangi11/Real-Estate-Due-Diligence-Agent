# System Architecture — Real Estate Due Diligence Agent Platform

## 1. Overview & High-Level Architecture

The **Real Estate Due Diligence Agent** is an enterprise multi-tier web application engineered to automate, analyze, and streamline due diligence operations for property transactions in India. The platform integrates property listings, multi-vector public registry verifications, AI-driven risk scoring algorithms, comprehensive report generation (PDF & Excel), and role-based operational dashboards.

```text
                                 +-----------------------------------+
                                 |          Web Browsers             |
                                 | (Chrome, Firefox, Safari, Edge)   |
                                 +-----------------+-----------------+
                                                   |
                                                   | HTTPS (JSON / REST)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                              |
|                                    React 18 + Vite (Port 5174 / 80)                               |
|                                                                                                    |
|  +-------------------------+  +-------------------------+  +------------------------------------+  |
|  |     Role Dashboards     |  |    Search & Discovery   |  |   Due Diligence & Risk Module      |  |
|  | Buyer, Agent, Legal,    |  | Property Search, Detail |  | Risk Assessment, Comparables,      |  |
|  | Financial, Admin        |  | Context Switcher        |  | Title, Zoning, Flood, Tax Audits   |  |
|  +-------------------------+  +-------------------------+  +------------------------------------+  |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | Axios API Client with JWT Request Interceptor & Centralized Error Handlers                   |  |
|  +----------------------------------------------------------------------------------------------+  |
+--------------------------------------------------+-------------------------------------------------+
                                                   |
                                                   | HTTP REST / JSON (Port 8081)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                   APPLICATION & API LAYER                                          |
|                                   Spring Boot 3.5.16 / Java 21+                                    |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | Security & Filter Pipeline: JWT Auth Filter, CORS Origin Validator, Security Entry Points    |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | REST Controllers: Auth, Property, Verification, Risk, Report, Admin, Audit, Notification   |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | Service Layer: Business Logic, Risk Engine, Report Exporters (PDF/Excel), Cache Optimization |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | Data Access Layer: Spring Data JPA Repositories (Batch queries, Specifications, Pageable)    |  |
|  +----------------------------------------------------------------------------------------------+  |
+--------------------------------------------------+-------------------------------------------------+
                                                   |
                                                   | JDBC / HikariCP Pool (Port 5432)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    PERSISTENCE LAYER                                               |
|                                    PostgreSQL 16 / 18 (`real_estate_due_diligence`)                |
|                                                                                                    |
|  +-------------------+  +-------------------+  +-------------------+  +-------------------------+  |
|  | Master Tables     |  | Property Tables   |  | Verification      |  | Analytics & Governance  |  |
|  | users, roles,     |  | properties,       |  | property_taxes,   |  | risk_assessments,       |  |
|  | addresses         |  | property_listings,|  | zoning_info,      |  | due_diligence_reports,  |  |
|  |                   |  | ownership_records |  | flood_info,       |  | audit_logs,             |  |
|  |                   |  |                   |  | permits, env      |  | notifications           |  |
|  +-------------------+  +-------------------+  +-------------------+  +-------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Key Architectural Modules

### 2.1 Presentation Tier (React + Vite + Tailwind CSS)
* **Single Page Application (SPA)**: Built using React 18 and Vite bundling.
* **Component-Based Hierarchy**: Modular presentation components structured by feature domains (`components/common`, `components/dashboard`, `components/property`, `components/legal`, `components/layout`).
* **Authentication Interceptor**: `apiClient.js` intercepts outgoing requests to inject `Authorization: Bearer <JWT>` headers and handles `401 Unauthorized` token expiration triggers gracefully.
* **Reactive State Synchronization**: `liveStore.js` coordinates client-side active selection identifiers (`active_property_id`) and UI bookmarks without storing mock datasets.

### 2.2 Application Tier (Spring Boot 3.5.16)
* **RESTful Controller Layer**: Clean API contracts with DTO validation (`@Valid`), OpenAPI documentation (`@Tag`, `@Operation`), and standardized JSON error responses.
* **Service Layer**: Decoupled interface/implementation pattern (`PropertyService`, `RiskService`, `ReportService`, `AuthService`, etc.).
* **Security Subsystem**: Stateless Spring Security utilizing JWT authentication filters, custom access denied handlers, and fine-grained role-based access controls (`@PreAuthorize`).
* **Batch Fetch Optimization**: Spring Data JPA repositories with batch `In` query derivations (`findByPropertyPropertyIdIn`) to eliminate N+1 database roundtrips.

### 2.3 Persistence Tier (PostgreSQL)
* **Normalized Relational Schema**: 14 distinct SQL modules with strict foreign key constraints, primary key sequences, and cascading rules.
* **Optimized B-Tree Indexes**: Indexed lookup columns on `property_code`, `property_id`, `user_id`, `email`, `status`, and timestamps for sub-millisecond retrieval.
* **ACID Transaction Management**: Spring `@Transactional` boundaries ensuring data consistency across multi-table operations.
