import { useState } from 'react';
import { DBProduct } from '@shared-types/db';
import { fetchProductsApi } from '@/lib/api/productApi';

export const useFetchProducts = () => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [resultSize, setResultSize] = useState(0);

  const fetchProducts = async (query: string, page: number, size: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsApi(query, page, size);
      setProducts(data.results);
      setCurrentPage(data.page);
      setTotalPages(data.total);
      setResultSize(data.size);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (query !== '') {
        setError('Failed to fetch products: ' + err);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    setProducts,
    loading,
    error,
    currentPage,
    totalPages,
    fetchProducts,
    resultSize,
  };
};
