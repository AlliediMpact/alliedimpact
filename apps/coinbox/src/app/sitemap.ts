import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coinbox.vercel.app';
  
  const staticPages = [
    '',
    '/auth',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  const publicDashboardPages = [
    '/dashboard',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const dashboardEntries: MetadataRoute.Sitemap = publicDashboardPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticEntries, ...dashboardEntries];
}
