import { api } from "@/lib/axios"
import { CreateAd, ListAdsParams } from "./ad.interface"
import { Ad, ListAds } from "@/type/ad"

const ADS_PREFIX = "/v1/ads"

export class AdsService {
	static async create(input: CreateAd): Promise<Ad> {
		interface requestResponse {
			advertisement: Ad
		}

		const resp = await api<requestResponse>({
			method: "POST",
			url: `${ADS_PREFIX}`,
			data: {
				title: input.title,
				description: input.description,
				imageUrl: input.imageUrl,

				petType: input.petType,
				petGender: input.petGender,
				petAgeMonth: input.petAgeMonth,
				petBreed: input.petBreed,

				country: input.country,
				city: input.city,
			},
		})

		return resp.data.advertisement
	}

	static async get(adId: string): Promise<Ad> {
		interface requestResponse {
			advertisement: Ad
		}

		const resp = await api<requestResponse>({
			method: "GET",
			url: `${ADS_PREFIX}/${adId}`,
		})

		return resp.data.advertisement
	}

	static async list(input: ListAdsParams): Promise<ListAds> {
		interface requestResponse {
			advertisements: Ad[]
			total: number
		}

		// TODO: hande diff query parameters
		const resp = await api<requestResponse>({
			method: "GET",
			url: `${ADS_PREFIX}`,
		})

		return {
			advertisements: resp.data.advertisements,
			total: resp.data.total,
		}
	}
}
