-- +goose Up
-- +goose StatementBegin

CREATE TYPE user_role AS ENUM('user', 'volunteer', 'shelter', 'admin');

CREATE TABLE IF NOT EXISTS users
(
    id uuid primary key default uuidv7(),
    role user_role not null default 'user',

    first_name text not null,
    last_name text not null,

    avatar_key text,

    email text not null,
    phone_number text,
    
    password text not null,

    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_phone_number_key UNIQUE (phone_number)
);

CREATE TYPE verification_request_status AS ENUM('pending', 'approved', 'rejected');

CREATE TABLE verification_requests (
    id uuid primary key default uuidv7(),
    user_id uuid not null references users(id) on delete cascade,
    requested_role user_role not null,
    
    status verification_request_status not null default 'pending',
    admin_notes TEXT,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    CONSTRAINT check_requested_role CHECK (requested_role IN ('volunteer'::user_role, 'shelter'::user_role))
);

CREATE TABLE IF NOT EXISTS verification_requests_documents
(
    request_id uuid not null references verification_requests(id) on delete cascade,
    document_key text not null,
    created_at timestamptz default now(),

    PRIMARY KEY (request_id, document_key)
);

CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);

CREATE UNIQUE INDEX idx_one_pending_request_per_user
ON verification_requests (user_id)
WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS advertisements
(
    id uuid primary key default uuidv7(),
    author_id uuid not null references users(id) on delete cascade,
    
    title text not null,
    description text not null,

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

CREATE TABLE IF NOT EXISTS advertisement_images
(
    ad_id uuid not null references advertisements(id) on delete cascade,
    image_key text not null,
    created_at timestamptz default now(),

    PRIMARY KEY (ad_id, image_key)
);

CREATE TABLE IF NOT EXISTS favorite_ads(
    id uuid primary key default uuidv7(),

    user_id uuid not null references users(id) on delete cascade,
    ad_id uuid not null references advertisements(id) on delete cascade,

    created_at timestamptz not null default now(),
    
    CONSTRAINT favorite_ads_user_id_ad_id_key UNIQUE(user_id, ad_id)
);

CREATE TABLE IF NOT EXISTS conversations
(
    id uuid primary key default uuidv7(),
    ad_id uuid not null references advertisements(id) on delete cascade,

    owner_id uuid references users(id) on delete cascade,
    adopter_id uuid references users(id) on delete cascade,

    created_at timestamptz not null default now(),
    
    CONSTRAINT conversations_ad_id_adopter_id_key UNIQUE(ad_id, adopter_id)
);

CREATE TABLE IF NOT EXISTS conversation_messages
(
    id uuid primary key default uuidv7(),

    conversation_id uuid not null references conversations(id) on delete cascade,
    sender_id uuid not null references users(id) on delete cascade,

    content text not null,
    is_read boolean not null default false,

    created_at timestamptz not null default now()
);

CREATE INDEX idx_messages_conversation_id_id ON conversation_messages(conversation_id, id DESC);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS conversation_messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS favorite_ads;
DROP TABLE IF EXISTS advertisement_images;
DROP TABLE IF EXISTS advertisements;

DROP TABLE IF EXISTS verification_requests_documents;
DROP TABLE IF EXISTS verification_requests;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS verification_request_status;
DROP TYPE IF EXISTS user_role;
-- +goose StatementEnd
