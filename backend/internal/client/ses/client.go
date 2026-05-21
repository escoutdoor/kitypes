package ses

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Client struct {
	sesClient   *ses.Client
	senderEmail string
}

func NewClient(ctx context.Context, region, accessKey, secretKey, senderEmail string) (*Client, error) {
	loaderOpts := []func(*config.LoadOptions) error{
		config.WithRegion(region),
	}

	if accessKey != "" && secretKey != "" {
		loaderOpts = append(loaderOpts, config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		))
	}

	cfg, err := config.LoadDefaultConfig(ctx, loaderOpts...)
	if err != nil {
		return nil, errwrap.Wrap("load aws default config for ses", err)
	}

	client := ses.NewFromConfig(cfg)

	return &Client{
		sesClient:   client,
		senderEmail: senderEmail,
	}, nil
}

func (c *Client) SendEmail(ctx context.Context, to, subject, htmlBody string) error {
	input := &ses.SendEmailInput{
		Destination: &types.Destination{
			ToAddresses: []string{to},
		},
		Message: &types.Message{
			Body: &types.Body{
				Html: &types.Content{
					Charset: aws.String("UTF-8"),
					Data:    aws.String(htmlBody),
				},
			},
			Subject: &types.Content{
				Charset: aws.String("UTF-8"),
				Data:    aws.String(subject),
			},
		},
		Source: aws.String(c.senderEmail),
	}

	_, err := c.sesClient.SendEmail(ctx, input)
	if err != nil {
		return errwrap.Wrap("send email via ses", err)
	}

	return nil
}
