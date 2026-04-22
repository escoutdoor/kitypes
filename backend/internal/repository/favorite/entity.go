package favorite

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Favorite struct {
	ID   string `db:"id"`
	AdID string `db:"ad_id"`

	CreatedAt time.Time `db:"created_at"`
}

func (e Favorite) ToEntity() entity.Favorite {
	return entity.Favorite{
		ID: e.ID,
		Ad: entity.Ad{
			ID: e.AdID,
		},
		CreatedAt: e.CreatedAt,
	}
}

type Favorites []Favorite

func (e Favorites) ToEntities() []entity.Favorite {
	list := make([]entity.Favorite, 0, len(e))
	for _, f := range e {
		list = append(list, f.ToEntity())
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
