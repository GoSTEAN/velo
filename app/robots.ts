import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.connectvelo.com';
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/blog'],
            disallow: ['/dashboard', '/auth']
        },
        sitemap: `${baseUrl}/sitemap.xml`
    }

}