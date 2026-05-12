-- +goose Up
-- +goose StatementBegin

CREATE TYPE report_target_type AS ENUM('ad', 'user', 'message');
CREATE TYPE report_reason AS ENUM('spam', 'scam', 'inappropriate', 'animal_cruelty', 'other');
CREATE TYPE report_status AS ENUM('pending', 'resolved', 'dismissed');

CREATE TABLE IF NOT EXISTS reports
(
    id uuid primary key default uuidv7(),
    reporter_id uuid references users(id) on delete set null,
    
    target_type report_target_type not null,
    target_id uuid not null,
    
    reason report_reason not null,
    comment text,
    
    status report_status not null default 'pending',
    admin_notes text,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    CONSTRAINT reports_reporter_target_unique UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS reports;
DROP TYPE IF EXISTS report_target_type;
DROP TYPE IF EXISTS report_reason;
DROP TYPE IF EXISTS report_status;
-- +goose StatementEnd
