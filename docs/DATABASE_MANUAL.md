# Database Manual & Schema Specification

**Database Engine**: PostgreSQL 16+ / 18+  
**Database Name**: `real_estate_due_diligence`  
**ORM Framework**: Hibernate 6 / Spring Data JPA  

---

## 1. Schema Modules & Execution Order

The database scripts located under `db_script/` structure the schema into 14 sequential files:

| Script File | Purpose | Primary Tables Created |
| :--- | :--- | :--- |
| `01_create_database.sql` | DB Creation | Database `real_estate_due_diligence` |
| `02_master_tables.sql` | Master Categories | `roles`, `property_types`, `risk_categories` |
| `03_user_tables.sql` | User Identity & Auth | `users`, `login_history` |
| `04_property_tables.sql` | Properties & Addresses | `properties`, `addresses`, `property_listings` |
| `05_ownership_tables.sql` | Title Registry & Deeds | `owners`, `ownership_records` |
| `06_verification_tables.sql` | 6 Public Data Vectors | `property_taxes`, `zoning_information`, `flood_information`, `permits`, `environmental_records`, `utility_information` |
| `07_risk_tables.sql` | Risk Engine Results | `risk_assessments` |
| `08_market_tables.sql` | Market Valuations | `comparable_properties`, `market_analyses` |
| `09_report_tables.sql` | Audit Reports & Docs | `due_diligence_reports`, `property_documents` |
| `10_notification_tables.sql` | User Alerts & Inboxes | `notifications` |
| `11_audit_tables.sql` | Security Trail | `audit_logs` |
| `12_api_tables.sql` | External Integrations | `api_providers`, `api_logs` |
| `13_indexes.sql` | Query Performance | B-Tree indexes on foreign keys, codes, timestamps |
| `14_seed_data.sql` | Master & Demo Data | Roles, property types, risk categories, sample properties |

---

## 2. Core Entity Relationships (ER Model)

```text
       +-------------------+
       |       roles       |
       +---------+---------+
                 | 1:N
                 v
       +-------------------+               +-------------------------+
       |       users       | ------------> |       audit_logs        |
       +---------+---------+ 1:N           +-------------------------+
                 |
                 | 1:N (created_by)
                 v
       +-------------------+ 1:N           +-------------------------+
       |    properties     +-------------> |        addresses        |
       +---------+---------+               +-------------------------+
                 |
                 +-----------------------> |    property_listings    |
                 | 1:N
                 +-----------------------> |    ownership_records    |
                 | 1:N
                 +-----------------------> |     property_taxes      |
                 | 1:N
                 +-----------------------> |   zoning_information    |
                 | 1:N
                 +-----------------------> |    flood_information    |
                 | 1:N
                 +-----------------------> |         permits         |
                 | 1:N
                 +-----------------------> |  environmental_records  |
                 | 1:N
                 +-----------------------> |   utility_information   |
                 | 1:N
                 +-----------------------> |    risk_assessments     |
                 | 1:N
                 +-----------------------> |  due_diligence_reports  |
                 | 1:N
                 +-----------------------> |  comparable_properties  |
```

---

## 3. Data Integrity & Schema Validation Rules

1. **Foreign Key Integrity**: All relational tables enforce `ON DELETE RESTRICT` or `ON DELETE CASCADE` appropriately to prevent orphaned verification entries.
2. **Precision & Financial Datatypes**: Monetary fields (`market_value`, `tax_amount`, `penalty_amount`, `listing_price`) use `DECIMAL(18, 2)` or `NUMERIC` to avoid floating-point inaccuracies.
3. **Auditability**: `created_at` and `updated_at` timestamps are automatically populated via JPA `@CreationTimestamp` and `@UpdateTimestamp`.
4. **Validation**: Spring Boot runs `spring.jpa.hibernate.ddl-auto: validate` in production, ensuring code entities exactly match database definitions without unintended schema drift.
