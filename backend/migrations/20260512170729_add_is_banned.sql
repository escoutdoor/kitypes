-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN is_banned boolean not null default false;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN is_banned;
-- +goose StatementEnd
