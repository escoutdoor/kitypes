import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    return {
        rules: {
            userAgent: '*',
            disallow: [
                '/admin/',
                '/profile/',
                '/my-ads/',
                '/messages/',
                '/favorites/',
                '/login',
                '/register',
                '/forgot-password',
                '/reset-password',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
