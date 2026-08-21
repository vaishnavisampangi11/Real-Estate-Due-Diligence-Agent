# Deployment & Containerization Guide

## 1. Local Docker Compose Deployment

The full-stack platform can be deployed locally using Docker Compose, orchestrating PostgreSQL, Spring Boot backend, and the React Nginx frontend.

### Prerequisites
* Docker Engine 24.0+ & Docker Compose v2.20+
* Minimum 4 GB free RAM

### Quick Start
```bash
# 1. Clone repository and navigate to project root
cd realstate/Real_Estate_Due_Diligence_Agent

# 2. Build and launch all container services in background
docker compose up --build -d

# 3. Verify service health
docker compose ps
```

### Access URLs
* **Frontend Web Application**: [http://localhost:5174](http://localhost:5174) or [http://localhost](http://localhost)
* **Backend REST API**: [http://localhost:8081](http://localhost:8081)
* **Swagger API UI**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
* **PostgreSQL Database**: `localhost:5432` (`real_estate_due_diligence`)

---

## 2. Cloud Deployment Architecture (AWS / Azure)

### 2.1 AWS Architecture (Amazon Web Services)
* **Database**: Amazon RDS for PostgreSQL (Multi-AZ, db.t3.medium+).
* **Backend API**: AWS ECS Fargate or AWS App Runner container running `backend/Dockerfile` with auto-scaling (2+ instances).
* **Frontend**: AWS S3 Static Website Hosting + CloudFront CDN (or ECS container behind Application Load Balancer).
* **Secrets Management**: AWS Secrets Manager / Parameter Store for `JWT_SECRET`, database credentials, and external API keys.

```text
[Internet Users] 
      │
      ▼
[AWS CloudFront CDN] ──────> [S3 Bucket / Frontend Container]
      │
      ▼ (API Traffic: /api/*)
[AWS Application Load Balancer]
      │
      ▼
[AWS ECS Fargate Tasks (Spring Boot API)]
      │
      ▼
[AWS RDS PostgreSQL Multi-AZ]
```

### 2.2 Azure Architecture (Microsoft Azure)
* **Database**: Azure Database for PostgreSQL Flexible Server.
* **Backend API**: Azure Container Apps or Azure App Service (Linux Containers) running backend image.
* **Frontend**: Azure Static Web Apps or Azure Container Apps with custom domain.
* **Key Management**: Azure Key Vault referenced via environment variables in Container Apps.

---

## 3. Production Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://postgres:5432/real_estate_due_diligence` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `tiger` (Use secure secret in production) |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | Base64-encoded 256-bit HMAC key | Custom 32+ byte string |
| `APPLICATION_SECURITY_JWT_EXPIRATION` | JWT validity in milliseconds | `86400000` (24 Hours) |
| `VITE_API_BASE_URL` | Backend endpoint for frontend client | `http://localhost:8081` |
