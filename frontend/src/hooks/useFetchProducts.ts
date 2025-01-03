import { useState } from 'react';
import { DBProduct } from '@shared-types/db';
import { fetchProductsApi } from '@/lib/api/productApi';

export const useFetchProducts = () => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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
      setTotalPages(Math.ceil(data.total / data.size));
      setResultSize(data.size);
    } catch (err: any) {
      console.log('Err', err);
      setError(err);
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
