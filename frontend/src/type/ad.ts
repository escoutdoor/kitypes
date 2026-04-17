export interface Ad {
	id: string
	authorId: string

	title: string
	description: string
	imageUrl: string

	petType: number
	petGender: number
	petAgeMonth?: number
	petBreed?: string

	country: string
	city: string

	status: number

	createdAt: Date
	updatedAt: Date
}

export interface ListAds {
	advertisements: Ad[]
	total: number
}
