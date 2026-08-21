-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 05_ownership_tables.sql
-- Module  : Ownership Management
-- ============================================================

-- ============================================================
-- Table: owners
-- ============================================================

CREATE TABLE owners (

    owner_id BIGSERIAL PRIMARY KEY,

    owner_name VARCHAR(200) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(20),

    owner_type VARCHAR(30) NOT NULL DEFAULT 'INDIVIDUAL',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table: ownership_records
-- ============================================================

CREATE TABLE ownership_records (

    ownership_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    owner_id BIGINT NOT NULL,

    ownership_percentage DECIMAL(5,2) NOT NULL,

    purchase_date DATE,

    sale_date DATE,

    is_current_owner BOOLEAN NOT NULL DEFAULT TRUE,

    verification_status BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ownership_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_ownership_owner
        FOREIGN KEY (owner_id)
        REFERENCES owners(owner_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_ownership_percentage
        CHECK (
            ownership_percentage > 0
            AND ownership_percentage <= 100
        )
);