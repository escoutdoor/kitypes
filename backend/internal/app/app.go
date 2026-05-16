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
	chat_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/chat/v1"
	fav_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/favorite/v1"
	report_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/report/v1"
	user_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/user/v1"
	verification_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/verification/v1"
	"github.com/escoutdoor/kitypes/backend/internal/middleware"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
	echo_middleware "github.com/labstack/echo/v4/middleware"
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
	go a.di.ChatHub(ctx).Run(ctx)

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

	e.Use(echo_middleware.RequestID())
	e.Use(echo_middleware.RequestLogger())
	e.Use(echo_middleware.Recover())

	e.Use(echo_middleware.CORSWithConfig(echo_middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	authMw := middleware.Auth(a.di.TokenProvider())
	optionalAuthMw := middleware.OptionalAuth(a.di.TokenProvider())
	v1Group := e.Group("/v1")

	ad_v1.RegisterHandlers(v1Group, authMw, optionalAuthMw, a.di.AdService(ctx), cv)

	v1AuthGroup := v1Group.Group("/auth")
	auth_v1.RegisterHandlers(v1AuthGroup, a.di.AuthService(ctx), cv)

	user_v1.RegisterHandlers(v1Group, authMw, a.di.UserService(ctx), cv)

	v1FavGroup := v1Group.Group("/favorites")
	fav_v1.RegisterHandlers(v1FavGroup, authMw, a.di.FavoriteService(ctx), cv)

	chat_v1.RegisterHandlers(v1Group, authMw, a.di.ChatService(ctx), cv, a.di.ChatHub(ctx))

	verification_v1.RegisterHandlers(
		v1Group,
		authMw,
		a.di.VerificationService(ctx),
		cv,
	)

	report_v1.RegisterHandlers(v1Group, authMw, a.di.ReportService(ctx), cv)

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
		case code.NotFound:
			respCode = http.StatusNotFound

		case code.AlreadyExists:
			respCode = http.StatusConflict

		case code.JwtTokenExpired, code.IncorrectCreadentials, code.InvalidJwtToken:
			respCode = http.StatusUnauthorized

		case code.PermissionDenied, code.CannotMessageYourself, code.UserBanned:
			respCode = http.StatusForbidden

		case code.RateLimitExceeded:
			respCode = http.StatusTooManyRequests

		case code.InvalidRequest, code.EmptyUpdate:
			respCode = http.StatusBadRequest
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
		resp = map[string]any{
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
