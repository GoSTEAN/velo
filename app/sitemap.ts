import type { MetadataRoute } from 'next'


export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://www.connectvelo.com',
            lastModified: new Date().toISOString(),
            priority: 1.0,
            changeFrequency: 'monthly',
        }
    ];
}