import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://internetscribe.com' // Replace with actual domain
  const formats = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'webm']

  const formatUrls = formats.map((format) => ({
    url: `${baseUrl}/transcribe/${format}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Get all blog posts
  const blogPosts = getSortedPostsData()
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...formatUrls,
    ...blogUrls,
  ]
}
