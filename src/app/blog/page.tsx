import Link from 'next/link';
import { getSortedPostsData } from '@/lib/blog';
import { Metadata } from 'next';
import { ArrowLeft, Clock, ArrowRight, Sparkles, FileText, Mic } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - AI Transcription Guides & Tips',
  description: 'Learn about AI transcription, audio processing, productivity tips, and how to get the most out of InternetScribe. Expert guides and tutorials.',
  openGraph: {
    title: 'Blog - InternetScribe',
    description: 'Expert guides on AI transcription, audio processing, and productivity.',
    url: 'https://internetscribe.com/blog',
  },
  alternates: {
    canonical: 'https://internetscribe.com/blog',
  },
};

// Reading time calculation
function getReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// Category mapping based on post content
function getCategory(id: string): { name: string; color: string; icon: typeof Sparkles } {
  if (id.includes('ai') || id.includes('speech') || id.includes('transcri')) {
    return { name: 'AI & Technology', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: Sparkles };
  }
  if (id.includes('audio') || id.includes('recording') || id.includes('voice')) {
    return { name: 'Audio Processing', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Mic };
  }
  return { name: 'Guides', color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: FileText };
}

export default function BlogIndex() {
  const allPostsData = getSortedPostsData();
  const featuredPosts = allPostsData.slice(0, 3);
  const regularPosts = allPostsData.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-muted/50 to-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Link>
          
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              InternetScribe Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Expert guides on AI transcription, audio processing, and productivity tips to help you work smarter.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {/* Featured Posts */}
        <section className="mb-16">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map(({ id, date, title, description }, index) => {
              const category = getCategory(id);
              const Icon = category.icon;
              const readTime = getReadingTime(description.length * 10); // Estimate
              
              return (
                <article 
                  key={id} 
                  className={`group relative rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-foreground/20 hover:-translate-y-1 ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${category.color}`}>
                      <Icon className="w-3 h-3" />
                      {category.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {readTime}
                    </span>
                  </div>
                  
                  <h3 className={`font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors ${
                    index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'
                  }`}>
                    <Link href={`/blog/${id}`}>
                      <span className="absolute inset-0" />
                      {title}
                    </Link>
                  </h3>
                  
                  <p className={`text-muted-foreground mb-4 ${index === 0 ? 'text-base' : 'text-sm line-clamp-2'}`}>
                    {description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <time dateTime={date} className="text-xs text-muted-foreground">
                      {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
            All Articles ({allPostsData.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map(({ id, date, title, description }) => {
              const category = getCategory(id);
              const Icon = category.icon;
              const readTime = getReadingTime(description.length * 10);
              
              return (
                <article 
                  key={id} 
                  className="group relative rounded-xl border border-border bg-card/50 p-5 transition-all hover:bg-card hover:shadow-md hover:border-foreground/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${category.color}`}>
                      <Icon className="w-3 h-3" />
                      {category.name}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/blog/${id}`}>
                      <span className="absolute inset-0" />
                      {title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {readTime}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20">
            <h2 className="text-2xl font-bold mb-2">Ready to Transcribe?</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try InternetScribe for free. Fast, accurate AI transcription in seconds.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Start Transcribing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
