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
    return size ? parseInt(size, 10) : 20;
  });
  const [sortRaw, setSortRaw] = useState(() => {
    return searchParams?.get('sort') === 'raw';
  });

  const PRICE_UPDATE_PERIOD_DAYS = 7;

  useEffect(() => {
    const fetchMarkups = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams?.get('page') || '1', 10);
        const size = parseInt(searchParams?.get('size') || '20', 10);
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
    router.push(
      `/markups?page=${page}&size=${perPage}&sort=${sortRaw ? 'raw' : 'percentage'}`
    );
  };

  const handlePerPageChange = (newPerPage: number) => {
    router.push(
      `/markups?page=1&size=${newPerPage}&sort=${sortRaw ? 'raw' : 'percentage'}`
    );
  };

  const handleSortChange = (isRaw: boolean) => {
    setSortRaw(isRaw);
    router.push(
      `/markups?page=1&size=${perPage}&sort=${isRaw ? 'raw' : 'percentage'}`
    );
  };

  return (
    <div className="container mx-auto min-h-screen mt-4 bg-background text-foreground">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-primary">Recent Markups</h1>

        {/* Description Section */}
        <div className="w-full text-left text-muted-foreground mb-8 italic">
          <p>
            Note: These price increases often reflect items returning to their
            regular prices after a sale, rather than a price hike. The data
            compares prices over the last{' '}
            <span className="font-semibold">{PRICE_UPDATE_PERIOD_DAYS}</span>{' '}
            days.
          </p>
        </div>

        <div className="w-full flex justify-between items-center mb-4">
          <div>
            <p className="text-lg font-semibold">
              Found <span className="text-primary">{resultSize}</span> result
              {resultSize > 1 ? 's' : ''}
            </p>
          </div>

          <PriceUpdatePageDropdown
            sortRaw={sortRaw}
            onSortChange={handleSortChange}
          />
        </div>

        {/* Products Section */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center mt-8">
              <LoadingIndicator />
            </div>
          ) : error ? (
            <div className="flex justify-center mt-8">
              <ErrorMessage error={error} />
            </div>
          ) : resultSize > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8 w-full">
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
    </div>
  );
}
