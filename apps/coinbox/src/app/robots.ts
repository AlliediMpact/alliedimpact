import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/admin/',
          '/dashboard/profile/',
          '/dashboard/settings/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/admin/',
        ],
      },
    ],
    sitemap: 'https://coinbox.vercel.app/sitemap.xml',
  };
}
