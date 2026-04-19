package code

type Code string

// TODO: refactor to more general view
const (
	NotFound Code = "NOT_FOUND"

	AlreadyExists Code = "ALREADY_EXISTS"

	PermissionDenied Code = "PERMISSION_DENIED"

	CannotMessageYourself Code = "CANNOT_MESSAGE_YOURSELF"

	EmptyUpdate Code = "EMPTY_UPDATE"

	IncorrectCreadentials Code = "INCORRECT_CREADENTIALS"
	JwtTokenExpired       Code = "JWT_TOKEN_EXPIRED"
	InvalidJwtToken       Code = "INVALID_JWT_TOKEN"

	InvalidRequest Code = "INVALID_REQUEST"
)
