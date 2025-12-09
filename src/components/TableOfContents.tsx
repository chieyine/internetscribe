'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/lib/blog';

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-2">
      <p className="font-semibold text-sm text-foreground mb-4 tracking-tight">On this page</p>
      <ul className="space-y-2.5 text-sm">
        {headings.map((heading) => (
          <li 
            key={heading.slug}
            style={{ paddingLeft: (heading.level - 2) * 12 }}
          >
            <a
              href={`#${heading.slug}`}
              className={cn(
                "block transition-colors duration-200 hover:text-foreground line-clamp-2",
                activeId === heading.slug
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.slug)?.scrollIntoView({
                  behavior: 'smooth'
                });
                setActiveId(heading.slug);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
