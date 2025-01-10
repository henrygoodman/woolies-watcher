'use client';

import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { fetchGlobalPriceUpdatesApi } from '@/lib/api/priceApi';
import { TopPriceUpdatesWithProducts } from '@shared-types/api';
import { useEffect, useState } from 'react';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [highlightedProducts, setHighlightedProducts] =
    useState<TopPriceUpdatesWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      try {
        const products = await fetchGlobalPriceUpdatesApi(20, 7);
        setHighlightedProducts(products);
      } catch (err) {
        console.error('Error fetching highlighted products:', err);
        setError('Failed to load highlighted products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedProducts();
  }, []);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  const { topDiscounts, topIncreases } = highlightedProducts!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />

      <div className="flex flex-col items-center p-8">
        <h1 className="text-2xl font-bold mb-8 text-primary">Popular Items</h1>

        {/* Carousel for popular products */}
        <div className="w-full max-w-5xl">
          <ProductCarousel />
        </div>
      </div>

      {topDiscounts?.length > 0 && (
        <div className="flex flex-col items-center p-8">
          <h1 className="text-2xl font-bold mb-4 text-primary">
            Recent Discounts
          </h1>
          {/* Carousel for price decreases */}
          <div className="w-full max-w-5xl">
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
        <div className="flex flex-col items-center p-8">
          <h1 className="text-2xl font-bold mb-8 text-primary">
            Recent Markups
          </h1>
          {/* Carousel for price increases */}
          <div className="w-full max-w-5xl">
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
