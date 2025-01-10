'use client';

import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { fetchDiscountsApi } from '@/lib/api/priceApi';
import { PriceUpdateWithProduct } from '@shared-types/api';
import PriceUpdatePageDropdown from '@/components/PriceUpdatePageDropdown';

export default function DiscountsPage() {
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
  const [sortRaw, setSortRaw] = useState(() => {
    return searchParams?.get('sort') === 'raw';
  });

  const PRICE_UPDATE_PERIOD_DAYS = 7;

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams?.get('page') || '1', 10);
        const size = parseInt(searchParams?.get('size') || '18', 10);
        const offset = (page - 1) * size;

        const response = await fetchDiscountsApi(
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
        console.error('Error fetching discounts:', err);
        setError('Failed to load discounts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [searchParams, sortRaw]);

  const handlePagination = (page: number) => {
    router.push(
      `/discounts?page=${page}&size=${perPage}&sort=${sortRaw ? 'raw' : 'percentage'}`
    );
  };

  const handlePerPageChange = (newPerPage: number) => {
    router.push(
      `/discounts?page=1&size=${newPerPage}&sort=${sortRaw ? 'raw' : 'percentage'}`
    );
  };

  const handleSortChange = (isRaw: boolean) => {
    setSortRaw(isRaw);
    router.push(
      `/discounts?page=1&size=${perPage}&sort=${isRaw ? 'raw' : 'percentage'}`
    );
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Current Discounts
        </h1>

        <div className="w-full flex justify-between items-center max-w-5xl mb-4">
          <div>
            <p className="text-lg font-semibold">
              Found <span className="text-primary">{resultSize}</span> recent
              discount
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
              {products.map((discount, index) => (
                <ProductCard
                  key={index}
                  product={discount.product}
                  priceUpdate={{
                    oldPrice: discount.old_price,
                    showPriceUpdateAsPercentage: !sortRaw,
                  }}
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
              No discounts available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
