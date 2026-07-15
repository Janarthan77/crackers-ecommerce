import ProductsClient from './ProductsClient';

export const revalidate = 60;

export default async function ProductsPage() {
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENTPOINT;
  
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${API_ENDPOINT}/api/products`, { next: { revalidate: 60 } }),
    fetch(`${API_ENDPOINT}/api/categories`, { next: { revalidate: 60 } })
  ]).catch(err => {
    console.error("Failed to fetch products page data:", err);
    return [null, null];
  });

  const productsData = productsRes?.ok ? await productsRes.json() : [];
  const categoriesData = categoriesRes?.ok ? await categoriesRes.json() : [];

  const initialProducts = Array.isArray(productsData) ? productsData : [];
  const initialCategories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <ProductsClient 
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
