'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SearchBar } from '@/components/ui/search-bar';
import { useFetchProducts } from '@/hooks/useFetchProducts';
import { usePollingUpdates } from '@/hooks/usePollingUpdates';

export default function Home() {
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

  usePollingUpdates(products, (updatedProducts) => {
    setProducts(updatedProducts);
  });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    fetchProducts(searchQuery, 1);
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-4">Search Groceries</h1>
      <SearchBar onSearch={handleSearch} />

      {loading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-5xl">
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

      {products.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNext={() => fetchProducts(query, currentPage + 1)}
          onPrevious={() => fetchProducts(query, currentPage - 1)}
        />
      )}
    </main>
  );
}
