package app

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/config"
	ad_repository "github.com/escoutdoor/kitypes/backend/internal/repository/ad"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/database/pg"
	"github.com/escoutdoor/kitypes/backend/pkg/database/txmanager"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
)

type di struct {
	dbClient  database.Client
	txManager database.TxManager

	adRepository *ad_repository.Repository

	adService *ad_service.Service
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
