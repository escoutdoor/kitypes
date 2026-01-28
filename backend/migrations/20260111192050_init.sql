-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS adverisements
(
    id uuid primary key default gen_random_uuid(),
    author_id uuid,
    
    title text not null,
    description text not null,
    image_url text not null,

    pet_type int not null,
    pet_gender int not null,
    pet_age_month int,
    pet_breed text,

    country text not null,
    city text not null,

    status int not null,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS users
(
    id uuid primary key default gen_random_uuid(),

    first_name text not null,
    last_name text not null,

    email text unique not null,
    phone_number text unique,
    
    password text not null,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS adverisements;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
