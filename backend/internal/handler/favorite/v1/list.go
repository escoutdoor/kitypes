package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List favorites
// @Description	Retrieves a paginated list of the user's favorite ads.
// @Tags			Favorites
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			limit	query		int						false	"Pagination limit"	default(10)
// @Param			offset	query		int						false	"Pagination offset"	default(0)
// @Param			sortBy	query		string					false	"Sort by date"		Enums(dateAsc, dateDesc)
// @Success		200		{object}	listResponse			"Favorites list"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/favorites [get]
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
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50" example:"10"`
	Offset int    `query:"offset" validate:"omitempty,gte=0" example:"0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc" example:"dateDesc"`
}

type listResponse struct {
	Favorites []favoriteResponse `json:"favorites"`
	Total     int                `json:"total" example:"3"`
}

func listRequestToInput(req listRequest, userID string) entity.ListFavoritesInput {
	return entity.ListFavoritesInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		SortBy: req.SortBy,

		UserID: userID,
	}
}
