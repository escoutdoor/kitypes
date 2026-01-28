package code

type Code string

const (
	AdNotFound   = "AD_NOT_FOUND"
	UserNotFound = "USER_NOT_FOUND"

	EmailAlreadyExists    Code = "EMAIL_ALREADY_EXISTS"
	IncorrectCreadentials Code = "INCORRECT_CREADENTIALS"
	JwtTokenExpired       Code = "JWT_TOKEN_EXPIRED"
	InvalidJwtToken       Code = "INVALID_JWT_TOKEN"
)
