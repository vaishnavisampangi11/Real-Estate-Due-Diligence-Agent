-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 12_api_tables.sql
-- Module  : API Integration
-- ============================================================

CREATE TABLE api_logs (

    api_log_id BIGSERIAL PRIMARY KEY,

    api_provider_id BIGINT NOT NULL,

    property_id BIGINT,

    endpoint VARCHAR(255),

    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    response_time_ms INTEGER,

    status_code INTEGER,

    success BOOLEAN DEFAULT TRUE,

    retry_count INTEGER DEFAULT 0,

    response_body JSONB,

    error_message TEXT,

    CONSTRAINT fk_api_provider
        FOREIGN KEY(api_provider_id)
        REFERENCES api_providers(api_provider_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_api_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE SET NULL
);