-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
-- +goose StatementEnd
