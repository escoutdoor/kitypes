package conversation

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Conversation struct {
	ID   string `db:"id"`
	AdID string `db:"ad_id"`

	OwnerID   string `db:"owner_id"`
	AdopterID string `db:"adopter_id"`

	CreatedAt time.Time `db:"created_at"`
}

func (c *Conversation) ToEntity() entity.Conversation {
	return entity.Conversation{
		ID:        c.ID,
		AdID:      c.AdID,
		OwnerID:   c.OwnerID,
		AdopterID: c.AdopterID,
		CreatedAt: c.CreatedAt,
	}
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
