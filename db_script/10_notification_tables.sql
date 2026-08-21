-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 10_notification_tables.sql
-- Module  : Notification
-- ============================================================

CREATE TABLE notifications (

    notification_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    property_id BIGINT,

    report_id BIGINT,

    notification_type VARCHAR(30) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notification_report
        FOREIGN KEY (report_id)
        REFERENCES due_diligence_reports(report_id)
        ON DELETE SET NULL
);