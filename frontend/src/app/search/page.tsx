'use client';

import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { useFetchProducts } from '@/hooks/useFetchProducts';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { products, loading, error, currentPage, totalPages, fetchProducts } =
    useFetchProducts();

  // Default value for perPage to avoid null issues
  const [perPage, setPerPage] = useState(() => {
    const size = searchParams?.get('size');
    return size ? parseInt(size, 10) : 18; // Default to 18
  });

  useEffect(() => {
    if (searchParams) {
      const searchQuery = searchParams.get('search') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const perPageFromQuery = parseInt(searchParams.get('size') || '18', 10);

      setPerPage(perPageFromQuery);
      fetchProducts(searchQuery, page, perPageFromQuery);

      if (searchQuery.trim()) {
        document.title = `${searchQuery} - Woolies Watcher`;
      }
    }
  }, [searchParams]);

  const handlePagination = (page: number) => {
    const query = searchParams?.get('search') || '';
    router.push(`/search?search=${query}&page=${page}&size=${perPage}`);
    fetchProducts(query, page, perPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    const query = searchParams?.get('search') || '';
    router.push(`/search?search=${query}&page=1&size=${newPerPage}`);
    fetchProducts(query, 1, newPerPage);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center p-8">
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-5xl">
            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            onNext={() => handlePagination(currentPage + 1)}
            onPrevious={() => handlePagination(currentPage - 1)}
            onPerPageChange={handlePerPageChange}
          />
        )}
      </div>
    </div>
  );
}
