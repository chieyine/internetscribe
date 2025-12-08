import Link from 'next/link';
import { getSortedPostsData } from '@/lib/blog';
import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - InternetScribe',
  description: 'Articles, guides, and tutorials about audio transcription, AI, and privacy.',
};

export default function BlogIndex() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Insights on AI transcription, privacy, and productivity.
          </p>
        </header>

        <main className="grid gap-8">
          {allPostsData.map(({ id, date, title, description }) => (
            <article key={id} className="group relative flex flex-col space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight group-hover:underline decoration-primary decoration-2 underline-offset-4">
                <Link href={`/blog/${id}`}>
                  <span className="absolute inset-0" />
                  {title}
                </Link>
              </h2>
              <p className="text-muted-foreground">{description}</p>
              <time dateTime={date} className="text-sm text-muted-foreground/60">
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
