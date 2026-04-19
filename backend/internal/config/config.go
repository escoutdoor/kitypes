package config

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/config/env"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/joho/godotenv"
)

type config struct {
	App        App
	HttpServer HttpServer
	Postgres   Postgres
	JwtToken   JwtToken
	Redis      Redis
	S3         S3
}

var cfg *config

func Config() *config {
	return cfg
}

type App interface {
	Name() string
	Stage() string
	IsProd() bool
	GracefulShutdownTimeout() time.Duration
}

type HttpServer interface {
	Address() string
}

type Postgres interface {
	Dsn() string
	MigrationsDir() string
}

type JwtToken interface {
	AccessTokenSecretKey() string
	AccessTokenTTL() time.Duration

	RefreshTokenSecretKey() string
	RefreshTokenTTL() time.Duration
}

type Redis interface {
	Addr() string
	DB() int
	Password() string
	MaxIdle() int
	DialTimeout() time.Duration
	ConnTimeout() time.Duration
	TTL() time.Duration
}

type S3 interface {
	Region() string
	AccessKey() string
	SecretAccessKey() string
	BucketName() string
	PublicBaseURL() string
}

func Load(paths ...string) error {
	if len(paths) > 0 {
		if err := godotenv.Load(paths...); err != nil {
			return errwrap.Wrap("load config", err)
		}
	}

	appConfig, err := env.NewAppConfig()
	if err != nil {
		return errwrap.Wrap("app config", err)
	}

	httpServerConfig, err := env.NewHttpServerConfig()
	if err != nil {
		return errwrap.Wrap("http server config", err)
	}

	postgresConfig, err := env.NewPostgresConfig()
	if err != nil {
		return errwrap.Wrap("postgres config", err)
	}

	jwtTokenConfig, err := env.NewJwtTokenConfig()
	if err != nil {
		return errwrap.Wrap("jwt token config", err)
	}

	redisConfig, err := env.NewRedisConfig()
	if err != nil {
		return errwrap.Wrap("redis config", err)
	}

	s3Config, err := env.NewS3Config()
	if err != nil {
		return errwrap.Wrap("s3 config", err)
	}

	cfg = &config{
		App:        appConfig,
		HttpServer: httpServerConfig,
		Postgres:   postgresConfig,
		JwtToken:   jwtTokenConfig,
		Redis:      redisConfig,
		S3:         s3Config,
	}

	return nil
}
