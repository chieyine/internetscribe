import { getAllPostIds, getPostData } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import ReadingProgress from '@/components/ReadingProgress';

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
      
      <ReadingProgress />

      <div className="min-h-screen bg-background text-foreground selection:bg-foreground/10">
        {/* Navigation Bar */}
        <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            <ShareButton title={postData.title} />
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
          {/* Article Header */}
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mb-6">
              <span className="text-primary bg-primary/5 px-3 py-1 rounded-full">
                {postData.category || 'Article'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              {postData.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              {postData.description}
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground border-t border-border pt-8 max-w-xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-foreground">InternetScribe Team</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <time dateTime={postData.date}>
                {new Date(postData.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{readTime}</span>
            </div>
          </header>

          {/* Inline Table of Contents */}
          {postData.headings && postData.headings.length > 0 && (
            <div className="bg-muted/30 rounded-2xl p-8 mb-16 border border-border">
              <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">In this article</p>
              <ul className="grid gap-2">
                {postData.headings.map((heading) => (
                  <li 
                    key={heading.slug}
                    style={{ paddingLeft: (heading.level - 2) * 16 }}
                  >
                    <a 
                      href={`#${heading.slug}`}
                      className="text-foreground/80 hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all text-sm font-medium"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Content */}
          <article 
            className="prose prose-zinc prose-lg max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:scroll-mt-24
              prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h3:scroll-mt-24
              prose-p:text-muted-foreground prose-p:leading-8 prose-p:mb-6
              prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-primary/20 hover:prose-a:border-primary transition-all
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-8 prose-ul:list-disc prose-ul:pl-6
              prose-li:text-muted-foreground prose-li:mb-2
              prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-900 prose-pre:text-zinc-50 prose-pre:p-6 prose-pre:rounded-xl prose-pre:shadow-lg
              prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-foreground prose-blockquote:bg-blue-50 prose-blockquote:p-8 prose-blockquote:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500
              prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border
              prose-hr:border-border prose-hr:my-16
              
              /* Table Styling */
              prose-table:w-full prose-table:my-12 prose-table:border-collapse prose-table:text-sm prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-border
              prose-thead:bg-muted/50 prose-thead:border-b prose-thead:border-border
              prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:text-foreground prose-th:uppercase prose-th:tracking-wider prose-th:text-xs
              prose-td:p-4 prose-td:border-b prose-td:border-border/50 prose-td:text-muted-foreground prose-td:bg-background
              prose-tr:last:prose-td:border-b-0
              prose-tr:hover:prose-td:bg-muted/20 transition-colors"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} 
          />
          
          {/* Footer CTA */}
          <div className="mt-20 p-10 bg-zinc-900 text-white rounded-3xl text-center shadow-xl">
            <h3 className="text-3xl font-bold mb-4">Transcribe smarter, not harder.</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto text-lg">
              Unlimited free transcription. Private. Secure. 
              No credit card required.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Start Transcribing
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
