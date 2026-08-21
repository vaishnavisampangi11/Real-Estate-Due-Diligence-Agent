-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 08_market_tables.sql
-- Module  : Comparable Property Analysis
-- ============================================================

CREATE TABLE comparable_properties (

    comparable_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    comparable_property_id BIGINT NOT NULL,

    distance_km DECIMAL(8,2),

    similarity_score DECIMAL(5,2),

    comparison_price DECIMAL(18,2),

    comparison_date DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comparable_property
        FOREIGN KEY(comparable_property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_similarity
        CHECK(similarity_score >=0 AND similarity_score <=100)
);