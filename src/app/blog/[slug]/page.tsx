import { getAllPostIds, getPostData } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

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
      title: 'Post Not Found - InternetScribe Blog',
    };
  }

  return {
    title: `${postData.title} - InternetScribe Blog`,
    description: postData.description,
    openGraph: {
      title: postData.title,
      description: postData.description,
      type: 'article',
      publishedTime: postData.date,
    },
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function Post({ params }: Props) {
  const slug = (await params).slug;
  const postData = await getPostData(slug);

  if (!postData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <article className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-6">
          <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
              {postData.title}
            </h1>
            <time dateTime={postData.date} className="text-muted-foreground block">
              {new Date(postData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} 
        />
        
        <hr className="border-border" />
        
        <div className="bg-muted/30 p-6 rounded-xl">
          <h3 className="font-semibold mb-2">Try InternetScribe for Free</h3>
          <p className="text-muted-foreground mb-4">
            Ready to transcribe your own audio? InternetScribe is free, private, and runs entirely in your browser.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Start Transcribing Now
          </Link>
        </div>
      </article>
    </div>
  );
}

