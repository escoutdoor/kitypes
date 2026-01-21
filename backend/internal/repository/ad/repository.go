package ad

import (
	"context"
	"errors"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "adverisements"

	idColumn       = "id"
	authorIDColumn = "author_id"

	titleColumn       = "title"
	descriptionColumn = "description"
	imageUrlColumn    = "image_url"

	petTypeColumn     = "pet_type"
	petGenderColumn   = "pet_gender"
	petAgeMonthColumn = "pet_age_month"
	petBreedColumn    = "pet_breed"

	countryColumn = "country"
	cityColumn    = "city"

	statusColumn = "status"

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

func (r *Repository) GetAd(ctx context.Context, adID string) (entity.Ad, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		authorIDColumn,
		titleColumn,
		descriptionColumn,
		imageUrlColumn,
		petTypeColumn,
		petGenderColumn,
		petAgeMonthColumn,
		petBreedColumn,
		countryColumn,
		cityColumn,
		statusColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{idColumn: adID}).
		ToSql()
	if err != nil {
		return entity.Ad{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.GetAd",
		Sql:  sql,
	}
	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.Ad{}, executeSQLError(err)
	}
	defer row.Close()

	var ad Ad
	if err := pgxscan.ScanOne(&ad, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.Ad{}, apperror.AdNotFoundID(adID)
		}

		return entity.Ad{}, scanRowError(err)
	}

	return ad.ToEntity(), nil
}

func (r *Repository) CreateAd(ctx context.Context, in ad_service.CreateAdInput) (string, error) {
	builder := r.qb.Insert(tableName).
		Columns(
			authorIDColumn,
			titleColumn,
			descriptionColumn,
			imageUrlColumn,
			petTypeColumn,
			petGenderColumn,
			countryColumn,
			cityColumn,
			statusColumn,
		).
		Values(
			in.AuthorID,
			in.Title,
			in.Description,
			in.ImageUrl,
			in.PetType,
			in.PetGender,
			in.Country,
			in.City,
			in.Status,
		).
		Suffix("RETURNING id")
	if in.PetAgeMonth != nil {
		builder = builder.Columns(petAgeMonthColumn)
		builder = builder.Values(*in.PetAgeMonth)
	}
	if in.PetBreed != nil {
		builder = builder.Columns(petBreedColumn)
		builder = builder.Values(*in.PetBreed)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return "", buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.CreateAd",
		Sql:  sql,
	}

	var createdAdID string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&createdAdID); err != nil {
		return "", scanRowError(err)
	}

	return createdAdID, nil
}

func (r *Repository) DeleteAd(ctx context.Context, adID string) error {
	sql, args, err := r.qb.Delete(tableName).
		From(tableName).
		Where(sq.Eq{idColumn: adID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.DeleteAd",
		Sql:  sql,
	}
	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) UpdateAd(ctx context.Context, in ad_service.UpdateAdInput) error {
	builder := r.qb.Update(tableName).
		Where(sq.Eq{idColumn: in.ID}).
		Set(updatedAtColumn, time.Now())

	if in.Title != nil {
		builder = builder.Set(titleColumn, *in.Title)
	}
	if in.Description != nil {
		builder = builder.Set(descriptionColumn, *in.Description)
	}
	if in.ImageUrl != nil {
		builder = builder.Set(imageUrlColumn, *in.ImageUrl)
	}
	if in.PetType != nil {
		builder = builder.Set(petTypeColumn, *in.PetType)
	}
	if in.PetGender != nil {
		builder = builder.Set(petGenderColumn, *in.PetGender)
	}
	if in.PetAgeMonth != nil {
		builder = builder.Set(petAgeMonthColumn, *in.PetAgeMonth)
	}
	if in.PetBreed != nil {
		builder = builder.Set(petBreedColumn, *in.PetBreed)
	}
	if in.Country != nil {
		builder = builder.Set(countryColumn, *in.Country)
	}
	if in.City != nil {
		builder = builder.Set(cityColumn, *in.City)
	}
	if in.Status != nil {
		builder = builder.Set(statusColumn, *in.Status)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.UpdateAd",
		Sql:  sql,
	}
	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) ListAds(ctx context.Context, in ad_service.ListAdsInput) ([]entity.Ad, int, error) {
	var (
		limit  = defaultLimit
		offset = defaultOffset
	)

	builder := r.qb.Select().From(tableName)

	if in.Search != nil {
		term := "%" + *in.Search + "%"
		builder = builder.Where(sq.Or{
			sq.ILike{titleColumn: term},
			sq.ILike{descriptionColumn: term},
		})
	}
	if in.Status != nil {
		builder = builder.Where(sq.Eq{statusColumn: *in.Status})
	}
	if in.Country != nil {
		builder = builder.Where(sq.Eq{countryColumn: *in.Country})
	}
	if in.City != nil {
		builder = builder.Where(sq.Eq{cityColumn: *in.City})
	}
	if in.PetType != nil {
		builder = builder.Where(sq.Eq{petTypeColumn: *in.PetType})
	}
	if in.PetGender != nil {
		builder = builder.Where(sq.Eq{petGenderColumn: *in.PetGender})
	}
	if in.MinPetAgeMonth != nil {
		builder = builder.Where(sq.GtOrEq{petAgeMonthColumn: *in.MinPetAgeMonth})
	}
	if in.MaxPetAgeMonth != nil {
		builder = builder.Where(sq.LtOrEq{petAgeMonthColumn: *in.MaxPetAgeMonth})
	}

	total, err := r.countAds(ctx, builder.Columns("COUNT(*)"))
	if err != nil {
		return nil, 0, err
	}
	if total == 0 {
		return []entity.Ad{}, 0, nil
	}

	switch in.SortBy {
	case "dateAsc":
		builder = builder.OrderBy("created_at ASC")
	case "dateDesc":
		builder = builder.OrderBy("created_at DESC")
	default:
		builder = builder.OrderBy("created_at DESC")
	}

	if in.Limit > 0 {
		limit = in.Limit
	}
	if in.Offset > 0 {
		offset = in.Offset
	}

	sql, args, err := builder.
		Columns(
			idColumn,
			authorIDColumn,
			titleColumn,
			descriptionColumn,
			imageUrlColumn,
			petTypeColumn,
			petGenderColumn,
			petAgeMonthColumn,
			petBreedColumn,
			countryColumn,
			cityColumn,
			statusColumn,
			createdAtColumn,
			updatedAtColumn,
		).
		Limit(uint64(limit)).
		Offset(uint64(offset)).
		ToSql()
	if err != nil {
		return nil, 0, errwrap.Wrap("list ads builder", buildSQLError(err))
	}

	q := database.Query{
		Name: "ad_repository.ListAds",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, 0, executeSQLError(err)
	}
	defer rows.Close()

	ads := make(Ads, 0, limit)
	if err := pgxscan.ScanAll(&ads, rows); err != nil {
		return nil, 0, scanRowsError(err)
	}

	return ads.ToEntityList(), total, nil
}

func (r *Repository) countAds(ctx context.Context, builder sq.SelectBuilder) (int, error) {
	sql, args, err := builder.ToSql()
	if err != nil {
		return 0, errwrap.Wrap("count ads builder", buildSQLError(err))
	}

	q := database.Query{
		Name: "ad_repository.countAds",
		Sql:  sql,
	}

	var total int
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&total); err != nil {
		return 0, scanRowError(err)
	}

	return total, nil
}
