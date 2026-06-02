package main

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/app"
	"github.com/escoutdoor/kitypes/backend/internal/config"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"go.uber.org/zap"
)

// main є точкою входу в програму.
// Алгоритм ініціалізації: завантаження конфігурації з .env, налаштування рівня логування
// залежно від середовища (prod/dev), створення застосунку та запуск серверів.
// Graceful shutdown реалізовано через closer для коректного завершення роботи.
//	@title			KityPes API
//	@version		1.0
//	@description	Pet adoption platform API.
//	@contact.name	API Support
//	@contact.email	vanap387@gmail.com

//	@BasePath	/v1

// @securityDefinitions.apikey	BearerAuth
// @in							header
// @name						Authorization
// @description				Type "Bearer " followed by a space and JWT token.
func main() {
	ctx := context.Background()
	if err := config.Load(".env"); err != nil {
		logger.Fatal(ctx, "load config:", err)
	}

	if config.Config().App.IsProd() {
		logger.SetLevel(zap.InfoLevel)
	} else {
		logger.SetLevel(zap.DebugLevel)
	}

	closer.SetShutdownTimeout(config.Config().App.GracefulShutdownTimeout())

	a, err := app.New(ctx)
	if err != nil {
		logger.FatalKV(ctx, "new application", "error", err.Error())
	}

	if err := a.Run(ctx); err != nil {
		logger.FatalKV(ctx, "run application", "error", err.Error())
	}

	closer.Wait()
}
