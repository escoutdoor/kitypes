package entity

import "time"

// Ad описує оголошення про тварину для адопції.
// Поле ImageKeys зберігає масив ключів S3 для зображень (підтримка кількох фото).
// PetAgeMonth використовує *int32 для можливості залишити вік невказаним.
// Status керує видимістю оголошення (відкрите, закрите, заблоковане).
type Ad struct {
	ID string

	AuthorID   string
	AuthorRole UserRole

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

	IsFavorite  bool
	BlockReason *string

	CreatedAt time.Time
	UpdatedAt time.Time
}

// EnrichedAd розширює Ad даними автора для відображення у списку без додаткового запиту.
type EnrichedAd struct {
	Ad

	AuthorName      string
	AuthorAvatarKey *string
}

// Перелічувані типи реалізовано через iota+1 для сумісності з БД (0 зарезервовано).
type (
	AdStatus  int32
	PetGender int32
	PetType   int32
)

const (
	AdStatusOpened AdStatus = iota + 1
	AdStatusClosed
	AdStatusBlocked
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

// CreateAdInput — DTO для створення оголошення. Поле Status дозволяє створювати чернетки.
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

// UpdateAdInput — DTO для оновлення оголошення. Всі поля опціональні для часткового оновлення.
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

// UpdateAdStatusInput — DTO для зміни статусу оголошення (для адміністраторів/модерації).
type UpdateAdStatusInput struct {
	ID     string
	Status AdStatus
}

// ListAdsInput — параметри фільтрації, сортування та пагінації оголошень.
// Поле ViewerID використовується для визначення IsFavorite для поточного користувача.
// VerifiedOnly фільтрує оголошення від верифікованих авторів.
type ListAdsInput struct {
	Limit  int
	Offset int
	SortBy string

	AuthorID *string

	Search *string

	Status *AdStatus

	Country *string
	City    *string

	PetType   *PetType
	PetGender *PetGender

	MinPetAgeMonth *int32
	MaxPetAgeMonth *int32

	AdIDs []string

	ViewerID *string

	VerifiedOnly *bool
}

// ListAdsOutput — результат пошуку з оголошеннями та загальною кількістю.
type ListAdsOutput struct {
	Ads   []Ad
	Total int
}

// AdImageUploadTarget містить препідписаний URL для прямого завантаження у S3.
type AdImageUploadTarget struct {
	UploadURL string
	ImageKey  string
}
