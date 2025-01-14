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

  const [perPage, setPerPage] = useState(() => {
    const size = searchParams?.get('size');
    return size ? parseInt(size, 10) : 20;
  });

  const query = searchParams?.get('q') || '';
  const page = parseInt(searchParams?.get('page') || '1', 10);

  const {
    products,
    isLoading,
    isError,
    error,
    currentPage,
    totalPages,
    resultSize,
  } = useFetchProducts(query, page, perPage);

  useEffect(() => {
    if (query.trim()) {
      document.title = `${query} - Woolies Watcher`;
    }
  }, [query]);

  const handlePagination = (newPage: number) => {
    router.push(`/search?q=${query}&page=${newPage}&size=${perPage}`);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    router.push(`/search?q=${query}&page=1&size=${newPerPage}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center">
        {isLoading && <LoadingIndicator />}
        {isError && <ErrorMessage error={String(error)} />}

        {!isLoading && !isError && (
          <>
            <div className="w-full text-center mt-4">
              {resultSize > 0 ? (
                <p className="text-lg font-semibold">
                  Found <span className="text-primary">{resultSize}</span>{' '}
                  result
                  {resultSize > 1 ? 's' : ''} for{' '}
                  <span className="italic">&quot;{query}&quot;</span>
                </p>
              ) : (
                <div className="text-center mt-8">
                  <p className="text-lg font-semibold text-gray-500">
                    No results found for{' '}
                    <span className="italic">
                      &quot;{query || 'your query'}&quot;
                    </span>
                    .
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Try adjusting your search or using different keywords.
                  </p>
                </div>
              )}
            </div>

            {resultSize > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8 w-full">
                {products.map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
              </div>
            )}
          </>
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
