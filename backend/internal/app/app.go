package app

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/config"
	ad_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/ad/v1"
	auth_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/auth/v1"
	user_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/user/v1"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pressly/goose/v3"

	"github.com/jackc/pgx/v5/stdlib"
)

type App struct {
	di *di

	httpServer *http.Server
}

func New(ctx context.Context) (*App, error) {
	app := &App{di: newDiContainer()}
	if err := app.initDeps(ctx); err != nil {
		return nil, err
	}

	if err := goose.SetDialect(string(goose.DialectPostgres)); err != nil {
		return nil, errwrap.Wrap("set migrations dialect", err)
	}

	db := stdlib.OpenDBFromPool(app.di.DBClient(ctx).DB().Pool())
	if err := goose.UpContext(ctx, db, config.Config().Postgres.MigrationsDir()); err != nil {
		return nil, errwrap.Wrap("migrate up", err)
	}

	if err := db.Close(); err != nil {
		return nil, errwrap.Wrap("close db after migrate up", err)
	}

	return app, nil
}

func (a *App) Run(ctx context.Context) error {
	go func() {
		logger.Info(ctx, "http server is running")
		if err := a.runHttpServer(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatal(ctx, "run http server: ", err)
		}
	}()

	return nil
}

func (a *App) initDeps(ctx context.Context) error {
	deps := []func(ctx context.Context) error{
		a.initHttpServer,
	}

	for _, d := range deps {
		if err := d(ctx); err != nil {
			return err
		}
	}

	return nil
}

func (a *App) initHttpServer(ctx context.Context) error {
	e := echo.New()

	cv := validator.New()
	e.Validator = cv

	e.HTTPErrorHandler = customHttpErrorHandler

	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	v1Group := e.Group("/v1")

	v1AdsGroup := v1Group.Group("/ads")
	ad_v1.RegisterHandlers(v1AdsGroup, a.di.AdService(ctx), cv)

	v1AuthGroup := v1Group.Group("/auth")
	auth_v1.RegisterHandlers(v1AuthGroup, a.di.AuthService(ctx), cv)

	v1UserGroup := v1Group.Group("/users")
	user_v1.RegisterHandlers(v1UserGroup, a.di.UserService(ctx), cv)

	s := &http.Server{
		Addr:              config.Config().HttpServer.Address(),
		Handler:           e,
		ReadTimeout:       time.Second * 5,
		ReadHeaderTimeout: time.Second * 5,
	}

	a.httpServer = s

	closer.Add(func(ctx context.Context) error {
		return a.httpServer.Shutdown(ctx)
	})

	return nil
}

func (a *App) runHttpServer() error {
	if err := a.httpServer.ListenAndServe(); err != nil {
		return errwrap.Wrap("http server listen and serve", err)
	}

	return nil
}

func customHttpErrorHandler(err error, c echo.Context) {
	ctx := c.Request().Context()
	respCode := http.StatusInternalServerError
	resp := map[string]any{
		"message": "internal server error",
	}

	var appErr *apperror.Error
	if errors.As(err, &appErr) {
		switch appErr.Code {
		case code.AdNotFound:
		case code.UserNotFound:
			respCode = http.StatusNotFound

		case code.EmailAlreadyExists:
			respCode = http.StatusConflict

		case code.JwtTokenExpired:
		case code.IncorrectCreadentials:
		case code.InvalidJwtToken:
			respCode = http.StatusUnauthorized
		}

		resp = map[string]any{
			"message": appErr.Error(),
		}

		if respCode == http.StatusInternalServerError {
			logger.Error(ctx, appErr.Error())
		}
	}

	if he, ok := err.(*echo.HTTPError); ok {
		respCode = he.Code
		resp = map[string]interface{}{
			"message": he.Message,
		}
	} else {
		logger.Error(ctx, err.Error())
	}

	if !c.Response().Committed {
		if c.Request().Method == http.MethodHead {
			err = c.NoContent(respCode)
		} else {
			err = c.JSON(respCode, resp)
		}
	}
}
