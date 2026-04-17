import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

interface RetryableRequest extends InternalAxiosRequestConfig {
	_isRetry?: boolean
}

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
})

api.interceptors.request.use(config => {
	const token = localStorage.getItem("accessToken")
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

interface RefreshResponse {
	accessToken: string
}

api.interceptors.response.use(
	config => config,
	async (error: AxiosError) => {
		const originalRequest = error.config as RetryableRequest

		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._isRetry
		) {
			originalRequest._isRetry = true

			try {
				const response = await axios.post<RefreshResponse>(
					`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
					{},
					{ withCredentials: true },
				)

				localStorage.setItem("accessToken", response.data.accessToken)
				originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`

				return api.request(originalRequest)
			} catch (e) {
				localStorage.removeItem("accessToken")
				return Promise.reject(e)
			}
		}
		throw error
	},
)

export { api }
