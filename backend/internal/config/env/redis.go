package env

import (
	"net"
	"strconv"
	"time"

	"github.com/caarlos0/env/v11"
)

type redisConfig struct {
	RedisHost string `env:"REDIS_HOST"`
	RedisPort int    `env:"REDIS_PORT"`

	RedisPassword string `env:"REDIS_PASSWORD"`
	RedisDB       int    `env:"REDIS_DB"`

	RedisMaxIdle     int           `env:"REDIS_MAX_IDLE"`
	RedisDialTimeout time.Duration `env:"REDIS_DIAL_TIMEOUT"`
	RedisConnTimeout time.Duration `env:"REDIS_CONNECTION_TIMEOUT"`

	RedisTTL time.Duration `env:"REDIS_TTL"`
}

func NewRedisConfig() (*redisConfig, error) {
	config := new(redisConfig)
	if err := env.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *redisConfig) Addr() string {
	return net.JoinHostPort(c.RedisHost, strconv.Itoa(c.RedisPort))
}

func (c *redisConfig) DB() int {
	return c.RedisDB
}

func (c *redisConfig) Password() string {
	return c.RedisPassword
}

func (c *redisConfig) MaxIdle() int {
	return c.RedisMaxIdle
}

func (c *redisConfig) DialTimeout() time.Duration {
	return c.RedisDialTimeout
}

func (c *redisConfig) ConnTimeout() time.Duration {
	return c.RedisConnTimeout
}

func (c *redisConfig) TTL() time.Duration {
	return c.RedisTTL
}
