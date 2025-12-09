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
        <div className="border-b border-border bg-background">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-12" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground truncate max-w-[200px]">{postData.title}</span>
            </nav>

            {/* Article Header */}
            <header className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-foreground">
                {postData.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
                {postData.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-8 border-t-2 border-foreground/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold">InternetScribe Team</p>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">AI Research</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground ml-auto">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(postData.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {readTime}
                  </span>
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-6 py-16">
          <div 
            className="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
              prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-foreground
              prose-h1:text-4xl prose-h1:mb-8
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-foreground/10
              prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-foreground prose-a:font-bold prose-a:no-underline prose-a:border-b-2 prose-a:border-foreground/20 hover:prose-a:border-foreground hover:prose-a:text-foreground transition-all
              prose-strong:text-foreground prose-strong:font-black
              prose-ul:my-8 prose-ul:list-disc prose-ul:pl-6
              prose-li:text-muted-foreground prose-li:mb-2 prose-li:pl-2
              prose-code:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-foreground prose-pre:text-background prose-pre:p-6 prose-pre:rounded-2xl prose-pre:shadow-2xl
              prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-foreground prose-blockquote:bg-muted/50 prose-blockquote:p-8 prose-blockquote:rounded-2xl prose-blockquote:border-l-8 prose-blockquote:border-foreground prose-blockquote:shadow-sm
              prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-12
              prose-hr:border-foreground/10 prose-hr:my-16
              prose-table:w-full prose-table:my-12 prose-table:border-collapse prose-table:border-2 prose-table:border-foreground
              prose-thead:bg-foreground prose-thead:text-background
              prose-th:p-4 prose-th:text-left prose-th:font-black prose-th:uppercase prose-th:tracking-wider prose-th:text-sm prose-th:border-2 prose-th:border-foreground
              prose-td:p-4 prose-td:border-2 prose-td:border-foreground prose-td:font-medium"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} 
          />
          
          {/* Share Section */}
          <div className="flex items-center justify-between py-12 mt-16 border-t-2 border-foreground/10">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-base font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </Link>
            
            <ShareButton title={postData.title} />
          </div>
        </article>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="bg-foreground text-background p-10 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Stop paying for transcription.</h3>
              <p className="text-xl text-background/80 mb-10 max-w-2xl leading-relaxed">
                InternetScribe gives you unlimited, private, AI-powered transcription for free. No credit card. No account. No BS.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-background text-foreground rounded-xl font-bold text-lg hover:bg-background/90 transition-transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                Start Transcribing Now
              </Link>
            </div>
            {/* Abstract background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-background/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-border bg-muted/30 py-20">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-black mb-10 tracking-tight">Read This Next</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map(({ id, title, date }) => (
                  <Link 
                    key={id}
                    href={`/blog/${id}`}
                    className="group flex flex-col h-full bg-background p-6 rounded-2xl border-2 border-transparent hover:border-foreground transition-all shadow-sm hover:shadow-xl"
                  >
                    <time className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4 block">
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <h3 className="text-xl font-bold leading-tight group-hover:text-foreground transition-colors mb-4">
                      {title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center text-sm font-bold text-foreground">
                      Read Article <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
