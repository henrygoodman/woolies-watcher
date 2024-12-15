'use client';

import { Navbar } from '@/components/Navbar';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/ui/search-bar';
import { useFetchProducts } from '@/hooks/useFetchProducts';
import { usePollingUpdates } from '@/hooks/usePollingUpdates';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    products,
    setProducts,
    loading,
    error,
    currentPage,
    totalPages,
    fetchProducts,
  } = useFetchProducts();

  const [query, setQuery] = useState('');
  const [perPage, setPerPage] = useState(() => {
    return parseInt(searchParams.get('size') || '18', 10);
  });

  usePollingUpdates(products, (updatedProducts) => {
    setProducts(updatedProducts);
  });

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPageFromQuery = parseInt(searchParams.get('size') || '18', 10);

    setQuery(searchQuery);
    setPerPage(perPageFromQuery);
    fetchProducts(searchQuery, page, perPageFromQuery);
  }, [searchParams, fetchProducts]);

  const handleSearch = (searchQuery: string) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    setQuery(encodedQuery);

    router.push(`/?search=${encodedQuery}&page=1&size=${perPage}`);
    fetchProducts(encodedQuery, 1, perPage);
  };

  const handlePagination = (page: number) => {
    router.push(`/?search=${query}&page=${page}&size=${perPage}`);
    fetchProducts(query, page, perPage);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);

    router.push(`/?search=${query}&page=1&size=${value}`);
    fetchProducts(query, 1, value);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Search Groceries
        </h1>

        <SearchBar onSearch={handleSearch} />

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive-foreground">Error: {error}</p>}

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
