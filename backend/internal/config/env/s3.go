package env

import (
	"github.com/caarlos0/env/v11"
)

type s3Config struct {
	S3Region          string `env:"AWS_REGION,required"`
	S3AccessKey       string `env:"AWS_ACCESS_KEY,required"`
	S3SecretAccessKey string `env:"AWS_SECRET_ACCESS_KEY,required"`
	S3BucketName      string `env:"AWS_S3_BUCKET_NAME,required"`
	S3PublicBaseURL   string `env:"AWS_PUBLIC_BASE_URL,required"`
}

func NewS3Config() (*s3Config, error) {
	config := new(s3Config)
	if err := env.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *s3Config) Region() string {
	return c.S3Region
}

func (c *s3Config) AccessKey() string {
	return c.S3AccessKey
}

func (c *s3Config) SecretAccessKey() string {
	return c.S3SecretAccessKey
}

func (c *s3Config) BucketName() string {
	return c.S3BucketName
}

func (c *s3Config) PublicBaseURL() string {
	return c.S3PublicBaseURL
}
