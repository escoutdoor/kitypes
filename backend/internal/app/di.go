package app

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/chat"
	"github.com/escoutdoor/kitypes/backend/internal/client/s3"
	"github.com/escoutdoor/kitypes/backend/internal/config"
	ad_repository "github.com/escoutdoor/kitypes/backend/internal/repository/ad"
	conversation_repository "github.com/escoutdoor/kitypes/backend/internal/repository/conversation"
	favorite_repository "github.com/escoutdoor/kitypes/backend/internal/repository/favorite"
	message_repository "github.com/escoutdoor/kitypes/backend/internal/repository/message"
	user_repository "github.com/escoutdoor/kitypes/backend/internal/repository/user"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	auth_service "github.com/escoutdoor/kitypes/backend/internal/service/auth"
	chat_service "github.com/escoutdoor/kitypes/backend/internal/service/chat"
	fav_service "github.com/escoutdoor/kitypes/backend/internal/service/favorite"
	user_service "github.com/escoutdoor/kitypes/backend/internal/service/user"
	"github.com/escoutdoor/kitypes/backend/internal/util/token"
	"github.com/escoutdoor/kitypes/backend/pkg/closer"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/database/pg"
	"github.com/escoutdoor/kitypes/backend/pkg/database/txmanager"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"github.com/redis/go-redis/v9"
)

type di struct {
	dbClient      database.Client
	s3Client      *s3.Client
	txManager     database.TxManager
	tokenProvider *token.TokenProvider

	redisClient *redis.Client

	adRepository           *ad_repository.Repository
	userRepository         *user_repository.Repository
	favoriteRepository     *favorite_repository.Repository
	conversationRepository *conversation_repository.Repository
	messageRepository      *message_repository.Repository

	adService       *ad_service.Service
	authService     *auth_service.Service
	userService     *user_service.Service
	favoriteService *fav_service.Service
	chatService     *chat_service.Service

	chatHub *chat.Chat
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

func (d *di) S3Client(ctx context.Context) *s3.Client {
	if d.s3Client == nil {
		client, err := s3.NewClient(
			ctx,
			config.Config().S3.Region(),
			config.Config().S3.AccessKey(),
			config.Config().S3.SecretAccessKey(),
			config.Config().S3.BucketName(),
			config.Config().S3.PublicBaseURL(),
		)
		if err != nil {
			logger.Fatal(ctx, "new s3 client", err)
		}

		d.s3Client = client
	}

	return d.s3Client
}

func (d *di) RedisClient(ctx context.Context) *redis.Client {
	if d.redisClient == nil {
		logger.Info(ctx, config.Config().Redis)
		client := redis.NewClient(&redis.Options{
			Addr:         config.Config().Redis.Addr(),
			DB:           config.Config().Redis.DB(),
			Password:     config.Config().Redis.Password(),
			MaxIdleConns: config.Config().Redis.MaxIdle(),
			DialTimeout:  config.Config().Redis.DialTimeout(),
		})

		if err := client.Ping(ctx).Err(); err != nil {
			logger.Fatal(ctx, "ping redis: ", err)
		}

		d.redisClient = client
		closer.Add(func(ctx context.Context) error {
			client.Close()
			return nil
		})
	}

	return d.redisClient
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
		d.adService = ad_service.New(d.AdRepository(ctx), d.UserRepository(ctx), d.TxManager(ctx), d.S3Client(ctx))
	}

	return d.adService
}

func (d *di) UserRepository(ctx context.Context) *user_repository.Repository {
	if d.userRepository == nil {
		d.userRepository = user_repository.New(d.DBClient(ctx))
	}

	return d.userRepository
}

func (d *di) FavoriteRepository(ctx context.Context) *favorite_repository.Repository {
	if d.favoriteRepository == nil {
		d.favoriteRepository = favorite_repository.New(d.DBClient(ctx))
	}
	return d.favoriteRepository
}

func (d *di) ConversationRepository(ctx context.Context) *conversation_repository.Repository {
	if d.conversationRepository == nil {
		d.conversationRepository = conversation_repository.New(d.DBClient(ctx))
	}
	return d.conversationRepository
}

func (d *di) MessageRepository(ctx context.Context) *message_repository.Repository {
	if d.messageRepository == nil {
		d.messageRepository = message_repository.New(d.DBClient(ctx))
	}
	return d.messageRepository
}

func (d *di) AuthService(ctx context.Context) *auth_service.Service {
	if d.authService == nil {
		d.authService = auth_service.New(d.UserRepository(ctx), d.TokenProvider())
	}

	return d.authService
}

func (d *di) UserService(ctx context.Context) *user_service.Service {
	if d.userService == nil {
		d.userService = user_service.New(d.UserRepository(ctx), d.S3Client(ctx))
	}

	return d.userService
}

func (d *di) FavoriteService(ctx context.Context) *fav_service.Service {
	if d.favoriteService == nil {
		d.favoriteService = fav_service.New(d.FavoriteRepository(ctx), d.AdRepository(ctx), d.S3Client(ctx))
	}

	return d.favoriteService
}
func (d *di) ChatService(ctx context.Context) *chat_service.Service {
	if d.chatService == nil {
		d.chatService = chat_service.New(
			d.ConversationRepository(ctx),
			d.MessageRepository(ctx),
			d.AdRepository(ctx),
			d.RedisClient(ctx),
		)
	}
	return d.chatService
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

func (d *di) ChatHub(ctx context.Context) *chat.Chat {
	if d.chatHub == nil {
		d.chatHub = chat.NewChat(d.RedisClient(ctx))
	}
	return d.chatHub
}
