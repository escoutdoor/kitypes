package code

type Code string

const (
	AdNotFound           Code = "AD_NOT_FOUND"
	UserNotFound         Code = "USER_NOT_FOUND"
	ConversationNotFound Code = "CONVERSATION_NOT_FOUND"

	PermissionDenied Code = "PERMISSION_DENIED"

	ConversationAlreadyExists Code = "CONVERSATION_ALREADY_EXISTS"
	CannotMessageYourself     Code = "CANNOT_MESSAGE_YOURSELF"

	EmailAlreadyExists    Code = "EMAIL_ALREADY_EXISTS"
	IncorrectCreadentials Code = "INCORRECT_CREADENTIALS"
	JwtTokenExpired       Code = "JWT_TOKEN_EXPIRED"
	InvalidJwtToken       Code = "INVALID_JWT_TOKEN"
)
