package ad

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Ad struct {
	ID string `db:"id"`

	AuthorID   string          `db:"author_id"`
	AuthorRole entity.UserRole `db:"author_role"`

	Title       string   `db:"title"`
	Description string   `db:"description"`
	ImageKeys   []string `db:"-"`

	PetType     entity.PetType   `db:"pet_type"`
	PetGender   entity.PetGender `db:"pet_gender"`
	PetAgeMonth *int32           `db:"pet_age_month"`
	PetBreed    *string          `db:"pet_breed"`

	Country string `db:"country"`
	City    string `db:"city"`

	Status entity.AdStatus `db:"status"`

	IsFavorite bool `db:"is_favorite"`

	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func (a Ad) ToEntity() entity.Ad {
	return entity.Ad{
		ID: a.ID,

		AuthorID:   a.AuthorID,
		AuthorRole: a.AuthorRole,

		Title:       a.Title,
		Description: a.Description,
		ImageKeys:   a.ImageKeys,

		PetType:     a.PetType,
		PetGender:   a.PetGender,
		PetAgeMonth: a.PetAgeMonth,
		PetBreed:    a.PetBreed,

		Country: a.Country,
		City:    a.City,

		Status: a.Status,

		IsFavorite: a.IsFavorite,

		CreatedAt: a.CreatedAt,
		UpdatedAt: a.UpdatedAt,
	}
}

type Ads []Ad

func (a Ads) ToEntityList() []entity.Ad {
	list := make([]entity.Ad, 0, len(a))
	for _, i := range a {
		list = append(list, i.ToEntity())
	}

	return list
}

func buildSQLError(err error) error {
	return errwrap.Wrap("build sql", err)
}

func executeSQLError(err error) error {
	return errwrap.Wrap("execute sql", err)
}

func scanRowError(err error) error {
	return errwrap.Wrap("scan row", err)
}

func scanRowsError(err error) error {
	return errwrap.Wrap("scan rows", err)
}

type adImageMapping struct {
	AdID string `db:"ad_id"`
	Key  string `db:"image_key"`
}

func prefixColumn(table string, col string) string {
	return table + "." + col
}

func prefixColumns(table string, cols ...string) []string {
	res := make([]string, len(cols))
	for i, col := range cols {
		res[i] = prefixColumn(table, col)
	}
	return res
}
