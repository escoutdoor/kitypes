package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) list(c echo.Context) error {
	var req listRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := listRequestToInput(req, userID)

	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	list := make([]favoriteResponse, 0, len(out.Favorites))
	for _, f := range out.Favorites {
		list = append(list, h.favoriteToResponse(f))
	}

	resp := listResponse{Favorites: list, Total: out.Total}
	return c.JSON(http.StatusOK, resp)
}

type listRequest struct {
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int    `query:"offset" validate:"omitempty,gte=0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc"`
}

type listResponse struct {
	Favorites []favoriteResponse `json:"favorites"`
	Total     int                `json:"total"`
}

func listRequestToInput(req listRequest, userID string) entity.ListFavoritesInput {
	return entity.ListFavoritesInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		SortBy: req.SortBy,

		UserID: userID,
	}
}
