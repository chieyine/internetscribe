import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

// ... (rest of the file)



const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostFrontmatter {
  title: string;
  date: string;
  description: string;
  category?: string;
}

export interface Heading {
  level: number;
  text: string;
  slug: string;
}

export interface PostData extends BlogPostFrontmatter {
  id: string;
  contentHtml?: string;
  headings?: Heading[];
}

export function getSortedPostsData(): PostData[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    } as PostData;
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id: string): Promise<PostData | null> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  
  // Check if file exists before reading
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Extract headings
    const headings: Heading[] = [];
    const headingRegex = /^(#{2,3})\s+(.*)$/gm;
    let match;
    while ((match = headingRegex.exec(matterResult.content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      headings.push({ level, text, slug });
    }

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
      .use(html)
      .use(remarkGfm)
      .process(matterResult.content);
    
    // Add ids to headings in HTML so TOC links work
    let contentHtml = processedContent.toString();
    headings.forEach(heading => {
      // This is a simple replacement, might be fragile if text contains special chars
      // But for this controlled content it should be fine
      // We are replacing <h2>Text</h2> with <h2 id="slug">Text</h2>
      const tag = `h${heading.level}`;
      const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'g');
      contentHtml = contentHtml.replace(regex, (match, content) => {
        if (content.includes(heading.text)) {
          return `<${tag} id="${heading.slug}">${content}</${tag}>`;
        }
        return match;
      });
    });

    // Combine the data with the id and contentHtml
    return {
      id,
      contentHtml,
      headings,
      ...matterResult.data,
    } as PostData;
  } catch (error) {
    console.error(`Error reading blog post ${id}:`, error);
    return null;
  }
}
