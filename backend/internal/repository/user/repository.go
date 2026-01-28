package user

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	auth_service "github.com/escoutdoor/kitypes/backend/internal/service/auth"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "users"

	idColumn = "id"

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

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (entity.User, error) {
	sql, args, err := r.qb.Select(
		idColumn,
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
		Name: "user_repository.GetUserByEmail",
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

func (r *Repository) GetUserByID(ctx context.Context, userID string) (entity.User, error) {
	sql, args, err := r.qb.Select(
		idColumn,
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
		Name: "user_repository.GetUserByID",
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

func (r *Repository) CreateUser(ctx context.Context, in auth_service.CreateUserInput) (string, error) {
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
