package entity

import "time"

type Ad struct {
	ID          string
	AuthorID    string
	Title       string
	Description string

	ImageKeys []string

	PetType     PetType
	PetGender   PetGender
	PetAgeMonth *int32
	PetBreed    *string

	Country string
	City    string

	Status AdStatus

	CreatedAt time.Time
	UpdatedAt time.Time
}

type (
	AdStatus  int32
	PetGender int32
	PetType   int32
)

const (
	AdStatusOpened AdStatus = iota + 1
	AdStatusClosed
)

const (
	PetGenderMale PetGender = iota + 1
	PetGenderFemale
)

const (
	PetTypeDog PetType = iota + 1
	PetTypeCat
	PetTypeOther
)

type CreateAdInput struct {
	UserID      string
	Title       string
	Description string

	ImageKeys []string

	PetType     PetType
	PetGender   PetGender
	PetAgeMonth *int32
	PetBreed    *string

	Country string
	City    string

	Status AdStatus
}

type UpdateAdInput struct {
	ID     string
	UserID string

	Title       *string
	Description *string
	ImageKeys   []string

	PetType     *PetType
	PetGender   *PetGender
	PetAgeMonth *int32
	PetBreed    *string

	Country *string
	City    *string

	Status *AdStatus
}

type ListAdsInput struct {
	Limit  int
	Offset int
	SortBy string

	Search *string

	Status *AdStatus

	Country *string
	City    *string

	PetType   *PetType
	PetGender *PetGender

	MinPetAgeMonth *int32
	MaxPetAgeMonth *int32
}

type ListAdsOutput struct {
	Ads   []Ad
	Total int
}
