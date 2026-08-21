-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 07_risk_tables.sql
-- Module  : Risk Assessment
-- ============================================================

-- ============================================================
-- Table: risk_assessments
-- ============================================================

CREATE TABLE risk_assessments (

    assessment_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    risk_category_id BIGINT NOT NULL,

    assessed_by BIGINT,

    risk_score DECIMAL(5,2) NOT NULL,

    risk_level VARCHAR(20) NOT NULL,

    recommendation TEXT,

    assessment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_risk_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_risk_category
        FOREIGN KEY (risk_category_id)
        REFERENCES risk_categories(risk_category_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_risk_user
        FOREIGN KEY (assessed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_risk_score
        CHECK (risk_score >= 0 AND risk_score <= 100)
);