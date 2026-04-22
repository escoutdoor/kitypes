package ad

import (
	"context"
	"errors"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName       = "advertisements"
	imagesTableName = "advertisement_images"

	idColumn       = "id"
	authorIDColumn = "author_id"

	titleColumn       = "title"
	descriptionColumn = "description"

	petTypeColumn     = "pet_type"
	petGenderColumn   = "pet_gender"
	petAgeMonthColumn = "pet_age_month"
	petBreedColumn    = "pet_breed"

	countryColumn = "country"
	cityColumn    = "city"

	statusColumn = "status"

	createdAtColumn = "created_at"
	updatedAtColumn = "updated_at"

	// ad_images
	adIDColumn     = "ad_id"
	imageKeyColumn = "image_key"
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

func (r *Repository) Get(ctx context.Context, adID string) (entity.Ad, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		authorIDColumn,
		titleColumn,
		descriptionColumn,
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
		Name: "ad_repository.Get",
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

	keys, err := r.GetImageKeys(ctx, ad.ID)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("get images keys", err)
	}

	ad.ImageKeys = keys
	return ad.ToEntity(), nil
}

func (r *Repository) Create(ctx context.Context, in entity.CreateAdInput) (string, error) {
	columns := []string{
		authorIDColumn,
		titleColumn,
		descriptionColumn,
		petTypeColumn,
		petGenderColumn,
		countryColumn,
		cityColumn,
		statusColumn,
	}
	values := []any{
		in.UserID,
		in.Title,
		in.Description,
		in.PetType,
		in.PetGender,
		in.Country,
		in.City,
		in.Status,
	}

	if in.PetAgeMonth != nil {
		columns = append(columns, petAgeMonthColumn)
		values = append(values, *in.PetAgeMonth)
	}
	if in.PetBreed != nil {
		columns = append(columns, petBreedColumn)
		values = append(values, *in.PetBreed)
	}

	sql, args, err := r.qb.Insert(tableName).
		Columns(columns...).
		Values(values...).
		Suffix("RETURNING id").
		ToSql()
	if err != nil {
		return "", buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.Create",
		Sql:  sql,
	}

	var createdAdID string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&createdAdID); err != nil {
		return "", scanRowError(err)
	}

	return createdAdID, nil
}

func (r *Repository) Delete(ctx context.Context, adID string) error {
	sql, args, err := r.qb.Delete(tableName).
		From(tableName).
		Where(sq.Eq{idColumn: adID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.Delete",
		Sql:  sql,
	}
	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) Update(ctx context.Context, in entity.UpdateAdInput) error {
	builder := r.qb.Update(tableName).
		Where(sq.Eq{idColumn: in.ID}).
		Set(updatedAtColumn, time.Now())

	if in.Title != nil {
		builder = builder.Set(titleColumn, *in.Title)
	}
	if in.Description != nil {
		builder = builder.Set(descriptionColumn, *in.Description)
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
		Name: "ad_repository.Update",
		Sql:  sql,
	}

	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error) {
	var (
		limit  = defaultLimit
		offset = defaultOffset
	)

	builder := r.qb.Select().From(tableName)

	if in.AuthorID != nil {
		builder = builder.Where(sq.Eq{authorIDColumn: *in.AuthorID})
	}
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
		return entity.ListAdsOutput{}, err
	}
	if total == 0 {
		return entity.ListAdsOutput{}, nil
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
		return entity.ListAdsOutput{}, errwrap.Wrap("list ads builder", buildSQLError(err))
	}

	q := database.Query{
		Name: "ad_repository.List",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.ListAdsOutput{}, executeSQLError(err)
	}
	defer rows.Close()

	ads := make(Ads, 0, limit)
	if err := pgxscan.ScanAll(&ads, rows); err != nil {
		return entity.ListAdsOutput{}, scanRowsError(err)
	}

	// get ad images
	adIDs := make([]string, len(ads))
	for i, a := range ads {
		adIDs[i] = a.ID
	}
	imgMap, err := r.getImagesMapForAds(ctx, adIDs)
	if err != nil {
		return entity.ListAdsOutput{}, errwrap.Wrap("get images map for ads", err)
	}
	for i := range ads {
		ads[i].ImageKeys = imgMap[ads[i].ID]
	}

	return entity.ListAdsOutput{
		Total: total,
		Ads:   ads.ToEntityList(),
	}, nil
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

func (r *Repository) GetImageKeys(ctx context.Context, adID string) ([]string, error) {
	sql, args, err := r.qb.Select(imageKeyColumn).
		From(imagesTableName).
		Where(sq.Eq{adIDColumn: adID}).
		ToSql()
	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.GetImageKeys",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, executeSQLError(err)
	}
	defer rows.Close()

	var keys []string
	if err := pgxscan.ScanAll(&keys, rows); err != nil {
		return nil, scanRowsError(err)
	}

	return keys, nil
}

func (r *Repository) AddImages(ctx context.Context, adID string, keys []string) error {
	builder := r.qb.Insert(imagesTableName).Columns(adIDColumn, imageKeyColumn)
	for _, k := range keys {
		builder = builder.Values(adID, k)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.AddImages",
		Sql:  sql,
	}

	_, err = r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) DeleteImages(ctx context.Context, adID string) error {
	sql, args, err := r.qb.Delete(imagesTableName).Where(sq.Eq{adIDColumn: adID}).ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.DeleteImages",
		Sql:  sql,
	}

	_, err = r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) getImagesMapForAds(ctx context.Context, adIDs []string) (map[string][]string, error) {
	if len(adIDs) == 0 {
		return make(map[string][]string), nil
	}

	sql, args, err := r.qb.Select(adIDColumn, imageKeyColumn).
		From(imagesTableName).
		Where(sq.Eq{adIDColumn: adIDs}).
		ToSql()
	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "ad_repository.getImagesMapForAds",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, executeSQLError(err)
	}
	defer rows.Close()

	var imgs []adImageMapping
	if err := pgxscan.ScanAll(&imgs, rows); err != nil {
		return nil, scanRowsError(err)
	}

	imgMap := make(map[string][]string)
	for _, img := range imgs {
		imgMap[img.AdID] = append(imgMap[img.AdID], img.Key)
	}

	return imgMap, nil
}
