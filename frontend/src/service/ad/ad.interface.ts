import { Ad } from "@/type/ad"

export interface CreateAd {
	title: string
	description: string
	imageUrl: string

	petType: number
	petGender: number

	petAgeMonth?: number
	petBreed?: string

	country: string
	city: string
}

export interface ListAdsParams {
	limit: number
	offset: number
	sortBy: string

	search?: string
	country?: string
	city?: string

	petType?: number
	petGender?: number
	status?: number

	minPetAgeMonth?: number
	maxPetAgeMonth?: number
}
