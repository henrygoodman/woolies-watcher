'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/ui/search-bar';
import { useFetchProducts } from '@/hooks/useFetchProducts';
import { usePollingUpdates } from '@/hooks/usePollingUpdates';
import { User } from '@shared-types/api';

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
  const [user, setUser] = useState<User | null>(null);

  usePollingUpdates(products, (updatedProducts) => {
    setProducts(updatedProducts);
  });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    fetchProducts(searchQuery, 1);
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
            onNext={() => fetchProducts(query, currentPage + 1)}
            onPrevious={() => fetchProducts(query, currentPage - 1)}
          />
        )}
      </div>
    </div>
  );
}
