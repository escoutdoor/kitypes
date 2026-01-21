package ad

import "github.com/escoutdoor/kitypes/backend/internal/entity"

type CreateAdInput struct {
	AuthorID string

	Title       string
	Description string
	ImageUrl    string

	PetType     entity.PetType
	PetGender   entity.PetGender
	PetAgeMonth *int32
	PetBreed    *string

	Country string
	City    string

	Status entity.AdStatus
}

type UpdateAdInput struct {
	ID string

	Title       *string
	Description *string
	ImageUrl    *string

	PetType     *entity.PetType
	PetGender   *entity.PetGender
	PetAgeMonth *int32
	PetBreed    *string

	Country *string
	City    *string

	Status *entity.AdStatus
}

type ListAdsInput struct {
	Limit  int
	Offset int
	SortBy string

	Search *string

	Status *entity.AdStatus

	Country *string
	City    *string

	PetType   *entity.PetType
	PetGender *entity.PetGender

	MinPetAgeMonth *int32
	MaxPetAgeMonth *int32
}

type ListAdsOutput struct {
	Ads   []entity.Ad
	Total int
}
