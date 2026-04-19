package user

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "users"

	idColumn = "id"

	avatarKeyColumn = "avatar_key"

	firstNameColumn = "first_name"
	lastNameColumn  = "last_name"

	emailColumn       = "email"
	phoneNumberColumn = "phone_number"

	passwordColumn = "password"

	createdAtColumn = "created_at"
	updatedAtColumn = "updated_at"
)

type Repository struct {
	db database.Client
	qb sq.StatementBuilderType
}

func New(db database.Client) *Repository {
	return &Repository{
		db: db,
		qb: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *Repository) GetByEmail(ctx context.Context, email string) (entity.User, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		avatarKeyColumn,
		firstNameColumn,
		lastNameColumn,
		emailColumn,
		phoneNumberColumn,
		passwordColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{emailColumn: email}).
		ToSql()
	if err != nil {
		return entity.User{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.GetByEmail",
		Sql:  sql,
	}
	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.User{}, executeSQLError(err)
	}
	defer row.Close()

	var u User
	if err := pgxscan.ScanOne(&u, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.User{}, apperror.UserNotFoundEmail(email)
		}

		return entity.User{}, scanRowError(err)
	}

	return u.ToEntity(), nil
}

func (r *Repository) GetByID(ctx context.Context, userID string) (entity.User, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		avatarKeyColumn,
		firstNameColumn,
		lastNameColumn,
		emailColumn,
		phoneNumberColumn,
		passwordColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return entity.User{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.GetByID",
		Sql:  sql,
	}
	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.User{}, executeSQLError(err)
	}
	defer row.Close()

	var u User
	if err := pgxscan.ScanOne(&u, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.User{}, apperror.UserNotFoundID(userID)
		}

		return entity.User{}, scanRowError(err)
	}

	return u.ToEntity(), nil
}

func (r *Repository) Create(ctx context.Context, in entity.CreateUserInput) (string, error) {
	sql, args, err := r.qb.Insert(tableName).
		Columns(
			firstNameColumn,
			lastNameColumn,
			emailColumn,
			phoneNumberColumn,
			passwordColumn,
		).
		Values(
			in.FirstName,
			in.LastName,
			in.Email,
			in.PhoneNumber,
			in.Password,
		).
		Suffix("RETURNING id").
		ToSql()
	if err != nil {
		return "", buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.CreateUser",
		Sql:  sql,
	}

	var createdUserID string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&createdUserID); err != nil {
		return "", scanRowError(err)
	}

	return createdUserID, nil
}

func (r *Repository) Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error) {
	builder := r.qb.Update(tableName).
		Where(sq.Eq{idColumn: in.ID}).
		Suffix(`RETURNING 
            id,
			avatar_key,
            first_name,
            last_name,
            email,
            phone_number,
            password,
            created_at,
            updated_at
        `)
	if in.AvatarKey != nil {
		builder = builder.Set(avatarKeyColumn, *in.AvatarKey)
	}
	if in.FirstName != nil {
		builder = builder.Set(firstNameColumn, *in.FirstName)
	}
	if in.LastName != nil {
		builder = builder.Set(lastNameColumn, *in.LastName)
	}
	if in.Email != nil {
		builder = builder.Set(emailColumn, *in.Email)
	}
	if in.Password != nil {
		builder = builder.Set(passwordColumn, *in.Password)
	}
	if in.PhoneNumber != nil {
		builder = builder.Set(phoneNumberColumn, *in.PhoneNumber)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return entity.User{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.Update",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.User{}, executeSQLError(err)
	}
	defer row.Close()

	var u User
	if err := pgxscan.ScanOne(&u, row); err != nil {
		return entity.User{}, scanRowError(err)
	}

	return u.ToEntity(), nil
}
