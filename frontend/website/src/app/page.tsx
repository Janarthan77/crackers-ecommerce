import HomeClient from './HomeClient';

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function HomePage() {
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENTPOINT;
  
  // Fetch all required data server-side to avoid client-side waterfalls and loading states
  const [blogsRes, feedbacksRes, productsRes, categoriesRes, comboOffersRes] = await Promise.all([
    fetch(`${API_ENDPOINT}/api/blogs`, { next: { revalidate: 60 } }),
    fetch(`${API_ENDPOINT}/api/feedback`, { next: { revalidate: 60 } }),
    fetch(`${API_ENDPOINT}/api/products`, { next: { revalidate: 60 } }),
    fetch(`${API_ENDPOINT}/api/categories`, { next: { revalidate: 60 } }),
    fetch(`${API_ENDPOINT}/api/combo-offers`, { next: { revalidate: 60 } })
  ]).catch(err => {
    console.error("Failed to fetch initial data for home page:", err);
    return [null, null, null, null, null];
  });

  const blogsData = blogsRes?.ok ? await blogsRes.json() : [];
  const feedbacksData = feedbacksRes?.ok ? await feedbacksRes.json() : [];
  const productsData = productsRes?.ok ? await productsRes.json() : [];
  const categoriesData = categoriesRes?.ok ? await categoriesRes.json() : [];
  const comboOffersData = comboOffersRes?.ok ? await comboOffersRes.json() : [];

  const initialBlogs = Array.isArray(blogsData) ? blogsData.filter(b => b.is_published).slice(0, 3) : [];
  const initialFeedbacks = Array.isArray(feedbacksData) ? feedbacksData : [];
  const initialProducts = Array.isArray(productsData) ? productsData : [];
  const initialCategories = Array.isArray(categoriesData) ? categoriesData : [];
  const initialComboOffers = Array.isArray(comboOffersData) ? comboOffersData.filter((o: any) => o.is_active) : [];

  return (
    <HomeClient 
      initialBlogs={initialBlogs}
      initialComboOffers={initialComboOffers}
      initialFeedbacks={initialFeedbacks}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
