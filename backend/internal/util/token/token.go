package token

import (
	"errors"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/golang-jwt/jwt/v5"
)

type TokenProvider struct {
	accessTokenSecretKey  string
	refreshTokenSecretKey string
	accessTokenTTL        time.Duration
	refreshTokenTTL       time.Duration
}

func NewTokenProvider(
	accessTokenSecretKey string,
	refreshTokenSecretKey string,
	accessTokenTTL time.Duration,
	refreshTokenTTL time.Duration,
) *TokenProvider {
	return &TokenProvider{
		accessTokenSecretKey:  accessTokenSecretKey,
		refreshTokenSecretKey: refreshTokenSecretKey,
		accessTokenTTL:        accessTokenTTL,
		refreshTokenTTL:       refreshTokenTTL,
	}
}

type accessTokenClaims struct {
	jwt.RegisteredClaims
	UserID string `json:"user_id"`
}

type refreshTokenClaims struct {
	jwt.RegisteredClaims
	UserID string `json:"user_id"`
}

func (p *TokenProvider) GenerateAccessToken(userID string) (string, error) {
	claims := accessTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(p.accessTokenTTL)),
		},
		UserID: userID,
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(p.accessTokenSecretKey))
	if err != nil {
		return "", errwrap.Wrap("new jwt token with claims", err)
	}

	return token, nil
}

func (p *TokenProvider) GenerateRefreshToken(userID string) (string, error) {
	claims := refreshTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(p.refreshTokenTTL)),
		},
		UserID: userID,
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(p.refreshTokenSecretKey))
	if err != nil {
		return "", errwrap.Wrap("new jwt token with claims", err)
	}

	return token, nil
}

func (p *TokenProvider) ValidateAccessToken(accessToken string) (string, error) {
	jwtToken, err := jwt.ParseWithClaims(accessToken, &accessTokenClaims{}, func(t *jwt.Token) (any, error) {
		return []byte(p.accessTokenSecretKey), nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", apperror.ErrJwtTokenExpired
		}

		return "", apperror.ErrInvalidJwtToken
	}

	if !jwtToken.Valid {
		return "", apperror.ErrInvalidJwtToken
	}

	claims, ok := jwtToken.Claims.(*accessTokenClaims)
	if !ok {
		return "", apperror.ErrInvalidJwtToken
	}

	return claims.UserID, nil
}

func (p *TokenProvider) ValidateRefreshToken(refreshToken string) (string, error) {
	jwtToken, err := jwt.ParseWithClaims(refreshToken, &refreshTokenClaims{}, func(t *jwt.Token) (any, error) {
		return []byte(p.refreshTokenSecretKey), nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", apperror.ErrJwtTokenExpired
		}

		return "", apperror.ErrInvalidJwtToken
	}

	if !jwtToken.Valid {
		return "", apperror.ErrInvalidJwtToken
	}

	claims, ok := jwtToken.Claims.(*refreshTokenClaims)
	if !ok {
		return "", apperror.ErrInvalidJwtToken
	}

	return claims.UserID, nil
}
