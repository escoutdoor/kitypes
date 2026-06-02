package config

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/config/env"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/joho/godotenv"
)

// config агрегує конфігурацію всіх підсистем.
// Використання інтерфейсів дозволяє підміняти реалізації при тестуванні.
type config struct {
	App              App
	HttpServer       HttpServer
	PrometheusServer HttpServer
	Postgres         Postgres
	JwtToken         JwtToken
	Redis            Redis
	S3               S3
	SES              SES
}

var cfg *config

func Config() *config {
	return cfg
}

// App описує загальні параметри застосунку: назва, середовище, таймаут graceful shutdown.
type App interface {
	Name() string
	Stage() string
	IsProd() bool
	GracefulShutdownTimeout() time.Duration
	FrontendURL() string
}

// HttpServer описує параметри HTTP-сервера (адреса прослуховування).
type HttpServer interface {
	Address() string
}

// Postgres описує параметри підключення до PostgreSQL та шлях до міграцій.
type Postgres interface {
	Dsn() string
	MigrationsDir() string
}

// JwtToken описує секрети та TTL для access/refresh токенів.
type JwtToken interface {
	AccessTokenSecretKey() string
	AccessTokenTTL() time.Duration

	RefreshTokenSecretKey() string
	RefreshTokenTTL() time.Duration
}

// Redis описує параметри кешування сесій та токенів.
type Redis interface {
	Addr() string
	DB() int
	Password() string
	MaxIdle() int
	DialTimeout() time.Duration
	ConnTimeout() time.Duration
	TTL() time.Duration
}

// S3 описує параметри хмарного сховища для завантаження зображень тварин.
type S3 interface {
	Region() string
	AccessKey() string
	SecretAccessKey() string
	BucketName() string
	PublicBaseURL() string
}

// SES описує параметри Amazon SES для відправки службових листів.
type SES interface {
	Region() string
	AccessKey() string
	SecretAccessKey() string
	SenderEmail() string
}

// Load завантажує конфігурацію з .env файлу або змінних середовища.
// Параметр paths дозволяє вказати додаткові шляхи до .env файлів.
// Повертає помилку, якщо обов'язкові змінні відсутні.
func Load(paths ...string) error {
	if len(paths) > 0 {
		// Якщо .env файл відсутній, використовуються системні змінні (Docker).
		_ = godotenv.Load(paths...)
	}

	appConfig, err := env.NewAppConfig()
	if err != nil {
		return errwrap.Wrap("app config", err)
	}

	httpServerConfig, err := env.NewHttpServerConfig()
	if err != nil {
		return errwrap.Wrap("http server config", err)
	}

	prometheusServerConfig, err := env.NewPrometheusServerConfig()
	if err != nil {
		return errwrap.Wrap("prometheus http server config", err)
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

	sesConfig, err := env.NewSESConfig()
	if err != nil {
		return errwrap.Wrap("ses config", err)
	}

	cfg = &config{
		App:              appConfig,
		HttpServer:       httpServerConfig,
		PrometheusServer: prometheusServerConfig,
		Postgres:         postgresConfig,
		JwtToken:         jwtTokenConfig,
		Redis:            redisConfig,
		S3:               s3Config,
		SES:              sesConfig,
	}

	return nil
}
