'use client';

import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { fetchGlobalPriceUpdatesApi } from '@/lib/api/priceApi';
import { TopPriceUpdatesWithProducts } from '@shared-types/api';
import { useQuery } from '@tanstack/react-query';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Fetch price changes for TODAY (show 2 days just for a buffer)
  const { data, error, isLoading, isError } = useQuery<
    TopPriceUpdatesWithProducts,
    Error
  >({
    queryKey: ['highlightedProducts'],
    queryFn: () => fetchGlobalPriceUpdatesApi(20, 2),
    staleTime: 360000,
  });

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorMessage error={(error as Error).message} />;

  const { topDiscounts, topIncreases } = data!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />

      <div className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Popular Items</h1>
        <div className="w-full">
          <ProductCarousel />
        </div>
      </div>

      {topDiscounts?.length > 0 && (
        <div className="flex flex-col items-center py-8">
          <h1 className="text-4xl font-bold mb-8 text-primary">
            Today's Discounts
          </h1>
          <div className="w-full">
            <ProductCarousel productList={topDiscounts} />
          </div>
          <button
            onClick={() => router.push('/discounts')}
            className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition"
          >
            See All Recent
          </button>
        </div>
      )}

      {topIncreases?.length > 0 && (
        <div className="flex flex-col items-center py-8">
          <h1 className="text-4xl font-bold mb-8 text-primary">
            Today's Markups
          </h1>
          <div className="w-full">
            <ProductCarousel productList={topIncreases} />
          </div>
          <button
            onClick={() => router.push('/markups')}
            className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition"
          >
            See All Recent
          </button>
        </div>
      )}
    </div>
  );
}
