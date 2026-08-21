# REST API Specification — Real Estate Due Diligence Agent

All backend endpoints are served under `http://localhost:8081` (or relative `/api/` in containerized environments). Protected endpoints require an HTTP header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New User
* **Method**: `POST`
* **Path**: `/api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "firstName": "Rama",
  "lastName": "Charan",
  "email": "buyer@example.com",
  "password": "Password123!",
  "phone": "+91 98765 43210",
  "role": "BUYER"
}
```
* **Response (200 OK)**:
```json
{
  "userId": 1,
  "firstName": "Rama",
  "lastName": "Charan",
  "email": "buyer@example.com",
  "message": "User registered successfully"
}
```

### 1.2 User Login
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "buyer@example.com",
  "password": "Password123!"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "firstName": "Rama",
  "lastName": "Charan",
  "email": "buyer@example.com",
  "role": "BUYER"
}
```

---

## 2. Property Endpoints (`/api/properties`)

### 2.1 Get All Properties (Paginated)
* **Method**: `GET`
* **Path**: `/api/properties?page=0&size=10`
* **Access**: Authenticated
* **Response (200 OK)**:
```json
{
  "content": [
    {
      "propertyId": 1,
      "propertyCode": "PROP-HYD-001",
      "propertyName": "Gachibowli Luxury Villa",
      "propertyType": "Villa",
      "builtYear": 2022,
      "totalArea": 4500.00,
      "marketValue": 42500000.00,
      "status": "VERIFIED",
      "address": {
        "addressId": 1,
        "addressLine1": "Plot 45, Sy. No. 112/A, Financial District",
        "city": "Hyderabad",
        "state": "Telangana",
        "postalCode": "500032"
      }
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

### 2.2 Search Properties with Criteria
* **Method**: `GET`
* **Path**: `/api/properties/search?city=Hyderabad&propertyType=Villa`
* **Access**: Authenticated
* **Parameters**: `city`, `state`, `postalCode`, `propertyType`, `status`, `minPrice`, `maxPrice`, `page`, `size`, `sortBy`, `sortDirection`
* **Response (200 OK)**: Page of `PropertyResponse`

### 2.3 Get Property by ID
* **Method**: `GET`
* **Path**: `/api/properties/{id}`
* **Access**: Authenticated
* **Response (200 OK)**: `PropertyResponse` object
* **Response (404 Not Found)**: `{"status": 404, "error": "Not Found", "message": "Property not found with ID: {id}"}`

### 2.4 Create New Property
* **Method**: `POST`
* **Path**: `/api/properties`
* **Access**: Authenticated (`ADMINISTRATOR`, `REAL_ESTATE_AGENT`)
* **Request Body**: `PropertyCreateRequest`
* **Response (201 Created)**: `PropertyResponse`

---

## 3. Verification Endpoints (`/api/verification/*`)

* **Property Taxes**: `GET /api/verification/taxes/property/{propertyId}`
* **Zoning Information**: `GET /api/verification/zoning/property/{propertyId}`
* **Flood Zone Data**: `GET /api/verification/flood/property/{propertyId}`
* **Building Permits**: `GET /api/verification/permits/property/{propertyId}`
* **Environmental Records**: `GET /api/verification/environmental/property/{propertyId}`
* **Utility Infrastructure**: `GET /api/verification/utilities/property/{propertyId}`

---

## 4. Due Diligence & Risk Endpoints

* **Get Risk Assessments**: `GET /api/risk-assessments/property/{propertyId}`
* **Get Comparable Properties**: `GET /api/comparable-properties/property/{propertyId}`
* **Get Property Reports**: `GET /api/reports/property/{propertyId}`
* **Generate Audit Report**: `POST /api/reports` (Body: `DueDiligenceReportRequest`)
* **Export Report PDF**: `GET /api/reports/{id}/pdf` (Returns `application/pdf` binary stream)
* **Export Report Excel**: `GET /api/reports/{id}/excel` (Returns `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` stream)

---

## 5. Notifications & Administration

* **Get User Notifications**: `GET /api/notifications`
* **Unread Count**: `GET /api/notifications/unread-count`
* **Audit Logs Feed**: `GET /api/admin/audit-logs`
* **Swagger UI / OpenAPI Documentation**: `GET /swagger-ui/index.html`
