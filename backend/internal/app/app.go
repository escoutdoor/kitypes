package app

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	docs "github.com/escoutdoor/kitypes/backend/docs"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/config"
	ad_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/ad/v1"
	auth_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/auth/v1"
	chat_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/chat/v1"
	fav_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/favorite/v1"
	observability_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/observability/v1"
	report_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/report/v1"
	support_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/support/v1"
	user_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/user/v1"
	verification_v1 "github.com/escoutdoor/kitypes/backend/internal/handler/verification/v1"
	"github.com/escoutdoor/kitypes/backend/internal/middleware"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/labstack/echo-contrib/echoprometheus"
	"github.com/labstack/echo/v4"
	echo_middleware "github.com/labstack/echo/v4/middleware"
	"github.com/pressly/goose/v3"
	echoswagger "github.com/swaggo/echo-swagger"
)

type App struct {
	di *di

	httpServer    *http.Server
	metricsServer *http.Server
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
		logger.Info(ctx, "metrics server is running on ", a.metricsServer.Addr)
		if err := a.runMetricsServer(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatal(ctx, "run metrics server: ", err)
		}
	}()

	go func() {
		logger.Info(ctx, "http server is running on ", a.httpServer.Addr)
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

	// init prometheus middleware
	prometheusMiddleware := echoprometheus.NewMiddleware(config.Config().App.Name())
	e.Use(prometheusMiddleware)

	e.Use(echo_middleware.CORSWithConfig(echo_middleware.CORSConfig{
		AllowOrigins: []string{
			config.Config().App.FrontendURL(),
		},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	if !config.Config().App.IsProd() {
		docs.SwaggerInfo.Title = config.Config().App.Name() + " API"
		docs.SwaggerInfo.Version = "1.0"
		docs.SwaggerInfo.BasePath = "/api/v1"

		// docs.SwaggerInfo.Host = config.Config().HttpServer.Address()

		e.GET("/swagger/*", echoswagger.WrapHandler)
		logger.Info(ctx, "Swagger UI is available at http://", config.Config().HttpServer.Address(), "/swagger/index.html")
	}

	authMw := middleware.Auth(a.di.TokenProvider())
	optionalAuthMw := middleware.OptionalAuth(a.di.TokenProvider())
	v1Group := e.Group("/api/v1")

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

	support_v1.RegisterHandlers(v1Group, optionalAuthMw, a.di.SupportService(ctx), cv)

	observability_v1.RegisterHandlers(v1Group)

	s := &http.Server{
		Addr:              config.Config().HttpServer.Address(),
		Handler:           e,
		ReadTimeout:       time.Second * 5,
		ReadHeaderTimeout: time.Second * 5,
	}
	a.httpServer = s

	metricsMux := echo.New()
	metricsMux.HideBanner = true
	metricsMux.GET("/metrics", echoprometheus.NewHandler())

	metricsServer := &http.Server{
		Addr:              config.Config().PrometheusServer.Address(),
		Handler:           metricsMux,
		ReadTimeout:       time.Second * 5,
		ReadHeaderTimeout: time.Second * 5,
	}
	a.metricsServer = metricsServer

	closer.Add(func(ctx context.Context) error {
		var errs []error

		if err := a.httpServer.Shutdown(ctx); err != nil {
			errs = append(errs, err)
		}
		if err := a.metricsServer.Shutdown(ctx); err != nil {
			errs = append(errs, err)
		}

		if len(errs) > 0 {
			return errors.Join(errs...)
		}

		return nil
	})

	return nil
}

func (a *App) runHttpServer() error {
	if err := a.httpServer.ListenAndServe(); err != nil {
		return errwrap.Wrap("http server listen and serve", err)
	}

	return nil
}

func (a *App) runMetricsServer() error {
	if err := a.metricsServer.ListenAndServe(); err != nil {
		return errwrap.Wrap("metrics server listen and serve", err)
	}

	return nil
}

func customHttpErrorHandler(err error, c echo.Context) {
	ctx := c.Request().Context()
	respCode := http.StatusInternalServerError

	resp := response.ErrorResponse{
		Message: "internal server error",
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

		resp.Message = appErr.Error()

		if respCode == http.StatusInternalServerError {
			logger.Error(ctx, appErr.Error())
		}
	} else if he, ok := err.(*echo.HTTPError); ok {
		respCode = he.Code

		if er, ok := he.Message.(response.ErrorResponse); ok {
			resp = er
		} else if strMsg, ok := he.Message.(string); ok {
			resp.Message = strMsg
		} else {
			resp.Message = fmt.Sprintf("%v", he.Message)
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
