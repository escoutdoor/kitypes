package auth

type LoginInput struct {
	Email    string
	Password string
}

type CreateUserInput struct {
	FirstName string
	LastName  string

	Email       string
	PhoneNumber string

	Password string
}

type Tokens struct {
	AccessToken  string
	RefreshToken string
}
