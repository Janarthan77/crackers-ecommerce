import BlogsClient from './BlogsClient';

export const revalidate = 60;

export default async function BlogsPage() {
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENTPOINT;
  
  const blogsRes = await fetch(`${API_ENDPOINT}/api/blogs`, { next: { revalidate: 60 } }).catch(err => {
    console.error("Failed to fetch blogs page data:", err);
    return null;
  });

  const blogsData = blogsRes?.ok ? await blogsRes.json() : [];

  const initialBlogs = Array.isArray(blogsData) ? blogsData.filter((b: any) => b.is_published) : [];

  return (
    <BlogsClient 
      initialBlogs={initialBlogs}
    />
  );
}
