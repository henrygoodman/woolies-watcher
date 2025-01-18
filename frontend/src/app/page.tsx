'use client';

import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { fetchGlobalPriceUpdatesApi } from '@/lib/api/priceApi';
import { TopPriceUpdatesWithProducts } from '@shared-types/api';
import { useQuery } from '@tanstack/react-query';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();

  // Always call hooks at the top level in the same order
  const { data: session, status } = useSession();
  const shouldFetch = status !== 'loading'; // Only fetch when session is not loading

  const { data, error, isLoading, isError } = useQuery<
    TopPriceUpdatesWithProducts,
    Error
  >({
    queryKey: ['highlightedProducts'],
    queryFn: () => fetchGlobalPriceUpdatesApi(20, 7),
    staleTime: 360000,
    enabled: shouldFetch, // Delay fetching until session status is determined
  });

  // Conditionally render based on session loading state
  if (status === 'loading') {
    return <LoadingIndicator />;
  }

  // Handle query loading and error states
  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorMessage error={error?.message || 'Error'} />;

  const { topDiscounts, topIncreases } = data!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Render HeroSection only if no session */}
      {!session && <HeroSection />}

      <div className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Popular Items</h1>
        <div className="w-full">
          <ProductCarousel />
        </div>
      </div>

      {topDiscounts?.length > 0 && (
        <div className="flex flex-col items-center py-8">
          <h1 className="text-4xl font-bold mb-8 text-primary">
            Recent Discounts
          </h1>
          <div className="w-full">
            <ProductCarousel productList={topDiscounts} />
          </div>
          <button
            onClick={() => router.push('/discounts')}
            className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition"
          >
            See All
          </button>
        </div>
      )}

      {topIncreases?.length > 0 && (
        <div className="flex flex-col items-center py-8">
          <h1 className="text-4xl font-bold mb-8 text-primary">
            Recent Markups
          </h1>
          <div className="w-full">
            <ProductCarousel productList={topIncreases} />
          </div>
          <button
            onClick={() => router.push('/markups')}
            className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition"
          >
            See All
          </button>
        </div>
      )}
    </div>
  );
}
