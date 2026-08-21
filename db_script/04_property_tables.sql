-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 04_property_tables.sql
-- Module  : Property Management
-- ============================================================

-- ============================================================
-- Table: properties
-- ============================================================

CREATE TABLE properties (

    property_id BIGSERIAL PRIMARY KEY,

    property_code VARCHAR(30) NOT NULL UNIQUE,

    external_property_id VARCHAR(100),

    property_type_id BIGINT NOT NULL,

    property_name VARCHAR(200) NOT NULL,

    description TEXT,

    built_year INTEGER,

    total_area DECIMAL(12,2),

    land_area DECIMAL(12,2),

    market_value DECIMAL(18,2),

    status VARCHAR(30) NOT NULL DEFAULT 'UNDER_REVIEW',

    source_provider VARCHAR(100),

    last_synced_at TIMESTAMP,

    created_by BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_type
        FOREIGN KEY (property_type_id)
        REFERENCES property_types(property_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_property_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_total_area
        CHECK (total_area IS NULL OR total_area > 0),

    CONSTRAINT chk_land_area
        CHECK (land_area IS NULL OR land_area > 0),

    CONSTRAINT chk_market_value
        CHECK (market_value IS NULL OR market_value >= 0)
);

-- ============================================================
-- Table: addresses
-- ============================================================

CREATE TABLE addresses (

    address_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    address_type VARCHAR(30) NOT NULL DEFAULT 'PHYSICAL',

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255),

    formatted_address TEXT,

    city VARCHAR(100) NOT NULL,

    district VARCHAR(100),

    state VARCHAR(100) NOT NULL,

    country VARCHAR(100) NOT NULL,

    postal_code VARCHAR(20) NOT NULL,

    latitude DECIMAL(10,7),

    longitude DECIMAL(10,7),

    validation_status BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_address_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ============================================================
-- Table: property_listings
-- ============================================================

CREATE TABLE property_listings (

    listing_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    listing_source VARCHAR(100),

    listing_url TEXT,

    listing_price DECIMAL(18,2),

    listing_date DATE,

    listing_status VARCHAR(30),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_listing_price
        CHECK (listing_price IS NULL OR listing_price >= 0)
);