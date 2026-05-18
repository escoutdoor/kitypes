package env

import (
	"github.com/caarlos0/env/v11"
)

type sesConfig struct {
	SESRegion          string `env:"AWS_REGION,required"`
	SESAccessKey       string `env:"AWS_ACCESS_KEY,required"`
	SESSecretAccessKey string `env:"AWS_SECRET_ACCESS_KEY,required"`
	SESSenderEmail     string `env:"AWS_SES_SENDER_EMAIL,required"`
}

func NewSESConfig() (*sesConfig, error) {
	config := new(sesConfig)
	if err := env.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *sesConfig) Region() string {
	return c.SESRegion
}

func (c *sesConfig) AccessKey() string {
	return c.SESAccessKey
}

func (c *sesConfig) SecretAccessKey() string {
	return c.SESSecretAccessKey
}

func (c *sesConfig) SenderEmail() string {
	return c.SESSenderEmail
}
