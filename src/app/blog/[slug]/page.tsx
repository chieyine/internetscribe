import { getAllPostIds, getPostData, getSortedPostsData } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/ShareButton';
import TableOfContents from '@/components/TableOfContents';
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
      
      <ReadingProgress />

      <div className="min-h-screen bg-background text-foreground selection:bg-foreground/10">
        {/* Header */}
        <div className="border-b border-border/40 bg-background/50 backdrop-blur-sm">
          <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Breadcrumbs */}
              <nav className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground/60" aria-label="Breadcrumb">
                <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/80 truncate max-w-[200px]">{postData.category || 'Article'}</span>
              </nav>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                {postData.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {postData.description}
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-foreground" />
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
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar: Table of Contents */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-auto pr-4">
                <div className="mb-6">
                  <Link 
                    href="/blog" 
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                  </Link>
                </div>
                <TableOfContents headings={postData.headings || []} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-7">
              <article 
                className="prose prose-zinc dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:scroll-mt-24
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:scroll-mt-24
                  prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-6
                  prose-a:text-foreground prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-foreground/20 hover:prose-a:border-foreground transition-all
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                  prose-li:text-muted-foreground prose-li:mb-2
                  prose-code:text-foreground prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl
                  prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-foreground prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:p-6 prose-blockquote:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:shadow-sm
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-border/50
                  prose-hr:border-border/50 prose-hr:my-12
                  
                  /* Custom Table Styling */
                  prose-table:w-full prose-table:my-8 prose-table:border-collapse prose-table:text-sm
                  prose-thead:bg-muted/30 prose-thead:border-b prose-thead:border-border
                  prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:text-foreground
                  prose-td:p-4 prose-td:border-b prose-td:border-border/50 prose-td:text-muted-foreground
                  prose-tr:hover:bg-muted/20 transition-colors"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} 
              />
            </main>

            {/* Right Sidebar: Share & CTA */}
            <aside className="hidden lg:block lg:col-span-2">
              <div className="sticky top-24 space-y-8">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Share</p>
                  <ShareButton title={postData.title} />
                </div>
                
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h4 className="font-semibold text-sm mb-2">Try InternetScribe</h4>
                  <p className="text-xs text-muted-foreground mb-4">Unlimited free transcription in your browser.</p>
                  <Link 
                    href="/"
                    className="block w-full py-2 px-3 bg-foreground text-background text-center text-xs font-medium rounded-lg hover:bg-foreground/90 transition-colors"
                  >
                    Start Now
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        </div>

        {/* Mobile Bottom Bar (CTA) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-40">
          <Link 
            href="/"
            className="flex items-center justify-center w-full py-3 bg-foreground text-background font-medium rounded-lg"
          >
            Start Transcribing Free
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-border/40 bg-muted/10 py-20 mt-20">
            <div className="max-w-[1200px] mx-auto px-6">
              <h2 className="text-2xl font-bold mb-8 tracking-tight">Read Next</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map(({ id, title, date }) => (
                  <Link 
                    key={id}
                    href={`/blog/${id}`}
                    className="group block"
                  >
                    <article className="h-full p-6 rounded-2xl bg-background border border-border/50 hover:border-foreground/20 transition-all hover:shadow-lg">
                      <time className="text-xs font-medium text-muted-foreground mb-3 block">
                        {new Date(date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <h3 className="text-lg font-semibold leading-snug group-hover:text-foreground/80 transition-colors mb-2">
                        {title}
                      </h3>
                      <div className="flex items-center text-sm font-medium text-muted-foreground mt-4 group-hover:text-foreground transition-colors">
                        Read Article <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </article>
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
