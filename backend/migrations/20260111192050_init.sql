-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS users
(
    id uuid primary key default gen_random_uuid(),

    first_name text not null,
    last_name text not null,

    avatar_url text,

    email text unique not null,
    phone_number text unique,
    
    password text not null,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS advertisements
(
    id uuid primary key default gen_random_uuid(),
    author_id uuid not null references users(id) on delete cascade,
    
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

CREATE TABLE IF NOT EXISTS favorite_ads(
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references users(id) on delete cascade,
    ad_id uuid not null references advertisements(id) on delete cascade,

    created_at timestamptz not null default now(),
    UNIQUE(user_id, ad_id)
);

CREATE TABLE IF NOT EXISTS conversations
(
    id uuid primary key default gen_random_uuid(),
    ad_id uuid not null references advertisements(id) on delete cascade,

    owner_id uuid references users(id) on delete cascade,
    adopter_id uuid references users(id) on delete cascade,

    created_at timestamptz not null default now(),
    UNIQUE(ad_id, adopter_id)
);

CREATE TABLE IF NOT EXISTS conversation_messages
(
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid not null references conversations(id) on delete cascade,
    sender_id uuid not null references users(id) on delete cascade,

    content text not null,
    is_read boolean not null default false,

    created_at timestamptz not null default now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS conversation_messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS favorite_ads;
DROP TABLE IF EXISTS advertisements;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
