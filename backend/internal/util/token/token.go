package token

import (
	"errors"
	"fmt"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
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

type TokenPayload struct {
	UserID string
	Role   entity.UserRole
}

type accessTokenClaims struct {
	jwt.RegisteredClaims
	UserID string          `json:"user_id"`
	Role   entity.UserRole `json:"role"`
}

type refreshTokenClaims struct {
	jwt.RegisteredClaims
	UserID string          `json:"user_id"`
	Role   entity.UserRole `json:"role"`
}

func (p *TokenProvider) GenerateAccessToken(userID string, role entity.UserRole) (string, error) {
	claims := accessTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(p.accessTokenTTL)),
		},
		UserID: userID,
		Role:   role,
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(p.accessTokenSecretKey))
	if err != nil {
		return "", errwrap.Wrap("new jwt token with claims", err)
	}

	return token, nil
}

func (p *TokenProvider) GenerateRefreshToken(userID string, role entity.UserRole) (string, error) {
	claims := refreshTokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(p.refreshTokenTTL)),
		},
		UserID: userID,
		Role:   role,
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(p.refreshTokenSecretKey))
	if err != nil {
		return "", errwrap.Wrap("new jwt token with claims", err)
	}

	return token, nil
}

func (p *TokenProvider) ValidateAccessToken(accessToken string) (TokenPayload, error) {
	jwtToken, err := jwt.ParseWithClaims(accessToken, &accessTokenClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(p.accessTokenSecretKey), nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return TokenPayload{}, apperror.ErrJwtTokenExpired
		}

		return TokenPayload{}, apperror.ErrInvalidJwtToken
	}

	if !jwtToken.Valid {
		return TokenPayload{}, apperror.ErrInvalidJwtToken
	}

	claims, ok := jwtToken.Claims.(*accessTokenClaims)
	if !ok {
		return TokenPayload{}, apperror.ErrInvalidJwtToken
	}

	return TokenPayload{
		UserID: claims.UserID,
		Role:   claims.Role,
	}, nil
}

func (p *TokenProvider) ValidateRefreshToken(refreshToken string) (TokenPayload, error) {
	jwtToken, err := jwt.ParseWithClaims(refreshToken, &refreshTokenClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(p.refreshTokenSecretKey), nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return TokenPayload{}, apperror.ErrJwtTokenExpired
		}

		return TokenPayload{}, apperror.ErrInvalidJwtToken
	}

	if !jwtToken.Valid {
		return TokenPayload{}, apperror.ErrInvalidJwtToken
	}

	claims, ok := jwtToken.Claims.(*refreshTokenClaims)
	if !ok {
		return TokenPayload{}, apperror.ErrInvalidJwtToken
	}

	return TokenPayload{
		UserID: claims.UserID,
		Role:   claims.Role,
	}, nil
}
