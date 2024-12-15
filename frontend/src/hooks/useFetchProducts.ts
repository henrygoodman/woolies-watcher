import { useState } from 'react';
import { Product } from '@shared-types/api';

export const useFetchProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async (query: string, page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/search?query=${query}&page=${page}&size=18`
      );
      if (!response.ok)
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setProducts(data.results);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
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
  };
};
