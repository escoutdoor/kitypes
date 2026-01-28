package app

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/config"
	ad_repository "github.com/escoutdoor/kitypes/backend/internal/repository/ad"
	user_repository "github.com/escoutdoor/kitypes/backend/internal/repository/user"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	auth_service "github.com/escoutdoor/kitypes/backend/internal/service/auth"
	user_service "github.com/escoutdoor/kitypes/backend/internal/service/user"
	"github.com/escoutdoor/kitypes/backend/internal/util/token"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/database/pg"
	"github.com/escoutdoor/kitypes/backend/pkg/database/txmanager"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
)

type di struct {
	dbClient      database.Client
	txManager     database.TxManager
	tokenProvider *token.TokenProvider

	adRepository   *ad_repository.Repository
	userRepository *user_repository.Repository

	adService   *ad_service.Service
	authService *auth_service.Service
	userService *user_service.Service
}

func newDiContainer() *di {
	return &di{}
}

func (d *di) DBClient(ctx context.Context) database.Client {
	if d.dbClient == nil {
		client, err := pg.NewClient(ctx, config.Config().Postgres.Dsn())
		if err != nil {
			logger.Fatal(ctx, "new database client", err)
		}

		if err := client.DB().Ping(ctx); err != nil {
			logger.Fatal(ctx, "ping database: %s", err)
		}

		d.dbClient = client
		closer.Add(func(ctx context.Context) error {
			client.Close()
			return nil
		})
	}

	return d.dbClient
}

func (d *di) TxManager(ctx context.Context) database.TxManager {
	if d.txManager == nil {
		d.txManager = txmanager.NewTransactionManager(d.DBClient(ctx).DB())
	}

	return d.txManager
}

func (d *di) AdRepository(ctx context.Context) *ad_repository.Repository {
	if d.adRepository == nil {
		d.adRepository = ad_repository.New(d.DBClient(ctx))
	}

	return d.adRepository
}

func (d *di) AdService(ctx context.Context) *ad_service.Service {
	if d.adService == nil {
		d.adService = ad_service.New(d.AdRepository(ctx), d.TxManager(ctx))
	}

	return d.adService
}

func (d *di) UserRepository(ctx context.Context) *user_repository.Repository {
	if d.userRepository == nil {
		d.userRepository = user_repository.New(d.DBClient(ctx))
	}

	return d.userRepository
}

func (d *di) AuthService(ctx context.Context) *auth_service.Service {
	if d.authService == nil {
		d.authService = auth_service.New(d.UserRepository(ctx), d.TokenProvider())
	}

	return d.authService
}

func (d *di) UserService(ctx context.Context) *user_service.Service {
	if d.userService == nil {
		d.userService = user_service.New(d.UserRepository(ctx))
	}
	return d.userService
}

func (d *di) TokenProvider() *token.TokenProvider {
	if d.tokenProvider == nil {
		d.tokenProvider = token.NewTokenProvider(
			config.Config().JwtToken.AccessTokenSecretKey(),
			config.Config().JwtToken.RefreshTokenSecretKey(),
			config.Config().JwtToken.AccessTokenTTL(),
			config.Config().JwtToken.RefreshTokenTTL(),
		)
	}

	return d.tokenProvider
}
