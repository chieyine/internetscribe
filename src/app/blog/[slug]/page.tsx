import { getAllPostIds, getPostData, getSortedPostsData } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const slug = (await params).slug;
  const postData = await getPostData(slug);

  if (!postData) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: postData.title,
    description: postData.description,
    authors: [{ name: 'InternetScribe Team' }],
    alternates: {
      canonical: `https://internetscribe.com/blog/${slug}`,
    },
    openGraph: {
      title: postData.title,
      description: postData.description,
      type: 'article',
      publishedTime: postData.date,
      authors: ['InternetScribe Team'],
      url: `https://internetscribe.com/blog/${slug}`,
      siteName: 'InternetScribe',
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: postData.description,
    },
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

// Get reading time
function getReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export default async function Post({ params }: Props) {
  const slug = (await params).slug;
  const postData = await getPostData(slug);

  if (!postData) {
    notFound();
  }

  // Get related posts (same category or recent)
  const allPosts = getSortedPostsData();
  const relatedPosts = allPosts
    .filter(post => post.id !== slug)
    .slice(0, 3);

  const readTime = getReadingTime(postData.contentHtml || '');

  // JSON-LD for article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postData.title,
    "description": postData.description,
    "datePublished": postData.date,
    "dateModified": postData.date,
    "author": {
      "@type": "Organization",
      "name": "InternetScribe",
      "url": "https://internetscribe.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "InternetScribe",
      "url": "https://internetscribe.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://internetscribe.com/blog/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground truncate max-w-[200px]">{postData.title}</span>
            </nav>

            {/* Article Header */}
            <header className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {postData.title}
              </h1>
              
              <p className="text-xl text-muted-foreground">
                {postData.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">InternetScribe Team</p>
                    <p className="text-xs text-muted-foreground">AI Transcription Experts</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(postData.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {readTime}
                  </span>
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-6 py-8">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
              prose-li:text-muted-foreground
              prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} 
          />
          
          {/* Share Section */}
          <div className="flex items-center justify-between py-8 mt-8 border-t border-border">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <ShareButton title={postData.title} />
          </div>
        </article>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto px-6 pb-8">
          <div className="bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-2">Try InternetScribe for Free</h3>
            <p className="text-background/80 mb-6">
              Ready to transcribe your own audio? Fast, accurate AI transcription powered by Google Gemini.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start Transcribing Now
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 pb-16">
            <h2 className="text-xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map(({ id, title, date }) => (
                <Link 
                  key={id}
                  href={`/blog/${id}`}
                  className="group p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-foreground/10 transition-all"
                >
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {title}
                  </h3>
                  <time className="text-xs text-muted-foreground">
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
