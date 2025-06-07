import express from 'express';
import { storage } from './storage';

const router = express.Router();

// Generate XML sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const properties = await storage.getProperties();
    
    const baseUrl = process.env.CLIENT_URL || 'https://southdelhirealty.com';
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Properties listing page -->
  <url>
    <loc>${baseUrl}/properties</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/cookies</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Add individual property pages
    properties.forEach(property => {
      const lastModified = property.updatedAt ? new Date(property.updatedAt).toISOString() : new Date().toISOString();
      sitemap += `
  <url>
    <loc>${baseUrl}/property/${property.slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add category pages
    const categories = ['apartment', 'independent-house', 'villa', 'commercial'];
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/properties?type=${category}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add location-based pages
    const locations = ['greater-kailash', 'defence-colony', 'lajpat-nagar', 'khan-market', 'safdarjung', 'green-park', 'hauz-khas', 'vasant-vihar', 'south-extension'];
    locations.forEach(location => {
      sitemap += `
  <url>
    <loc>${baseUrl}/properties?location=${location}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'text/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://southdelhirealty.com';
  
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /private/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block access to admin and private areas
User-agent: *
Disallow: /admin/
Disallow: /auth/
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /*.json$
Disallow: /*?*&
Disallow: /*?*sort=
Disallow: /*?*page=

# Allow important assets
Allow: /assets/
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

export default router; 