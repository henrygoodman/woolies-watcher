'use client';

import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { fetchMarkupsApi } from '@/lib/api/priceApi';
import { PriceUpdateWithProduct } from '@shared-types/api';
import PriceUpdatePageDropdown from '@/components/PriceUpdatePageDropdown';

export default function MarkupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<PriceUpdateWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [perPage, setPerPage] = useState(() => {
    const size = searchParams?.get('size');
    return size ? parseInt(size, 10) : 18;
  });
  const [sortRaw, setSortRaw] = useState(false);

  const PRICE_UPDATE_PERIOD_DAYS = 7;

  useEffect(() => {
    const fetchMarkups = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams?.get('page') || '1', 10);
        const size = parseInt(searchParams?.get('size') || '18', 10);
        const offset = (page - 1) * size;

        const response = await fetchMarkupsApi(
          size,
          offset,
          PRICE_UPDATE_PERIOD_DAYS,
          sortRaw
        );

        setProducts(response.results);
        setResultSize(response.total_results);
        setTotalPages(response.total_pages);
        setCurrentPage(page);
        setPerPage(size);
      } catch (err) {
        console.error('Error fetching markups:', err);
        setError('Failed to load markups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkups();
  }, [searchParams, sortRaw]);

  const handlePagination = (page: number) => {
    router.push(`/markups?page=${page}&size=${perPage}`);
  };

  const handlePerPageChange = (newPerPage: number) => {
    router.push(`/markups?page=1&size=${newPerPage}`);
  };

  const handleSortChange = (isRaw: boolean) => {
    setSortRaw(isRaw);
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Marked-up Products
        </h1>

        <div className="w-full flex justify-between items-center max-w-5xl mb-4">
          <div>
            <p className="text-lg font-semibold">
              Found <span className="text-primary">{resultSize}</span> recent
              markup
              {resultSize > 1 ? 's' : ''}
            </p>
          </div>

          <PriceUpdatePageDropdown
            sortRaw={sortRaw}
            onSortChange={handleSortChange}
          />
        </div>

        {resultSize > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-5xl">
              {products.map((markup, index) => (
                <ProductCard
                  key={index}
                  product={markup.product}
                  priceUpdate={
                    markup.old_price
                      ? {
                          oldPrice: markup.old_price,
                          showPriceUpdateAsPercentage: !sortRaw,
                        }
                      : undefined
                  }
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              perPage={perPage}
              onNext={() => handlePagination(currentPage + 1)}
              onPrevious={() => handlePagination(currentPage - 1)}
              onPerPageChange={handlePerPageChange}
            />
          </>
        ) : (
          <div className="text-center mt-8">
            <p className="text-lg font-semibold text-gray-500">
              No markups available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
