-- ============================================================
-- Table: property_taxes
-- ============================================================

CREATE TABLE property_taxes (

    tax_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    tax_year INTEGER NOT NULL,

    assessed_value DECIMAL(18,2),

    tax_amount DECIMAL(18,2) NOT NULL,

    due_amount DECIMAL(18,2) DEFAULT 0,

    paid_amount DECIMAL(18,2) DEFAULT 0,

    payment_status VARCHAR(20) DEFAULT 'PENDING',

    payment_date DATE,

    tax_receipt_number VARCHAR(100),

    tax_authority VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tax_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_tax_amount
        CHECK (tax_amount >= 0)
);

-- ============================================================
-- Table: permits
-- ============================================================

CREATE TABLE permits (

    permit_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    permit_number VARCHAR(100) UNIQUE,

    permit_type VARCHAR(100),

    issuing_authority VARCHAR(200),

    issue_date DATE,

    expiry_date DATE,

    status VARCHAR(30),

    document_url TEXT,

    verification_status VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_permit_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

-- ============================================================
-- Table: zoning_information
-- ============================================================

CREATE TABLE zoning_information (

    zoning_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    zone_code VARCHAR(50),

    zone_name VARCHAR(150),

    land_use VARCHAR(100),

    max_building_height DECIMAL(8,2),

    floor_area_ratio DECIMAL(6,2),

    compliance_status BOOLEAN DEFAULT TRUE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_zoning_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

-- ============================================================
-- Table: flood_information
-- ============================================================

CREATE TABLE flood_information (

    flood_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    flood_zone VARCHAR(30),

    flood_risk_level VARCHAR(30),

    insurance_required BOOLEAN DEFAULT FALSE,

    last_verified DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_flood_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

-- ============================================================
-- Table: environmental_records
-- ============================================================

CREATE TABLE environmental_records (

    environmental_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    record_type VARCHAR(100),

    risk_level VARCHAR(30),

    issuing_authority VARCHAR(150),

    report_date DATE,

    description TEXT,

    report_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_environment_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);

-- ============================================================
-- Table: utility_information
-- ============================================================

CREATE TABLE utility_information (

    utility_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    utility_type VARCHAR(50),

    provider_name VARCHAR(150),

    connection_status VARCHAR(30),

    account_reference VARCHAR(100),

    last_bill_date DATE,

    provider_contact VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_utility_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE
);