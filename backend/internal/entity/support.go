package entity

type SendContactInput struct {
	Subject   string
	Email     string
	Message   string
	UserID    *string
	IPAddress string
}
