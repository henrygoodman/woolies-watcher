import { useQuery } from '@tanstack/react-query';
import { fetchProductsApi } from '@/lib/api/productApi';

export const useFetchProducts = (query: string, page: number, size: number) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', query, page, size],
    queryFn: () => fetchProductsApi(query, page, size),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.results || [];
  const currentPage = data?.page || 1;
  const totalPages = data?.total_pages || 0;
  const resultSize = data?.total_results || 0;

  return {
    products,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    resultSize,
  };
};
