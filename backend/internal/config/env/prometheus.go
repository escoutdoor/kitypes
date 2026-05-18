package env

import (
	"net"

	"github.com/caarlos0/env/v11"
)

type prometheusServerConfig struct {
	Host string `env:"PROMETHEUS_SERVER_HOST,required"`
	Port string `env:"PROMETHEUS_SERVER_PORT,required"`
}

func NewPrometheusServerConfig() (*prometheusServerConfig, error) {
	config := new(prometheusServerConfig)
	if err := env.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *prometheusServerConfig) Address() string {
	return net.JoinHostPort(c.Host, c.Port)
}
