-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 09_report_tables.sql
-- Module  : Report Generation
-- ============================================================

-- ============================================================
-- Table: due_diligence_reports
-- ============================================================

CREATE TABLE due_diligence_reports (

    report_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    generated_by BIGINT NOT NULL,

    report_name VARCHAR(255) NOT NULL,

    executive_summary TEXT,

    overall_risk_score DECIMAL(5,2),

    report_status VARCHAR(30) NOT NULL DEFAULT 'GENERATED',

    pdf_path TEXT,

    excel_path TEXT,

    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_user
        FOREIGN KEY(generated_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_report_score
        CHECK(overall_risk_score IS NULL
        OR (overall_risk_score >=0 AND overall_risk_score <=100))
);

-- ============================================================
-- Table: property_documents
-- ============================================================

CREATE TABLE property_documents (

    document_id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    report_id BIGINT,

    document_type VARCHAR(50) NOT NULL,

    document_name VARCHAR(255) NOT NULL,

    file_path TEXT NOT NULL,

    file_format VARCHAR(20),

    uploaded_by BIGINT,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_property
        FOREIGN KEY(property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_report
        FOREIGN KEY(report_id)
        REFERENCES due_diligence_reports(report_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_document_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);