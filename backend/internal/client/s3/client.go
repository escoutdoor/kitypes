package s3

import (
	"context"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Client struct {
	s3Client      *s3.Client
	presign       *s3.PresignClient
	bucket        string
	publicBaseURL string
}

func NewClient(ctx context.Context, region, accessKey, secretKey, bucket string, publicBaseURL string) (*Client, error) {
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
		return nil, errwrap.Wrap("load aws default config for s3", err)
	}

	client := s3.NewFromConfig(cfg)
	presignClient := s3.NewPresignClient(client)

	return &Client{
		s3Client:      client,
		presign:       presignClient,
		bucket:        bucket,
		publicBaseURL: publicBaseURL,
	}, nil
}

func (c *Client) GeneratePresignedUploadURL(ctx context.Context, key, contentType string, lifetime time.Duration) (string, error) {
	req, err := c.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(c.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(lifetime))

	if err != nil {
		return "", errwrap.Wrap("presign put object", err)
	}

	return req.URL, nil
}

func (c *Client) GeneratePresignedDownloadURL(ctx context.Context, key string, lifetime time.Duration) (string, error) {
	req, err := c.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(lifetime))

	if err != nil {
		return "", errwrap.Wrap("presign get object", err)
	}

	return req.URL, nil
}

func (c *Client) BuildPublicURL(key string) string {
	base := strings.TrimRight(c.publicBaseURL, "/")
	k := strings.TrimLeft(key, "/")
	return base + "/" + k
}

func (c *Client) DeleteFiles(ctx context.Context, keys []string) error {
	if len(keys) == 0 {
		return nil
	}

	var objectIds []types.ObjectIdentifier
	for _, key := range keys {
		objectIds = append(objectIds, types.ObjectIdentifier{Key: aws.String(key)})
	}

	_, err := c.s3Client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
		Bucket: aws.String(c.bucket),
		Delete: &types.Delete{
			Objects: objectIds,
			Quiet:   aws.Bool(true),
		},
	})

	if err != nil {
		return errwrap.Wrap("delete objects from s3", err)
	}

	return nil
}
