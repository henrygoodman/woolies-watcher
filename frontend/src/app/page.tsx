'use client';

import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { fetchGlobalPriceUpdatesApi } from '@/lib/api/priceApi';
import { TopPriceUpdatesWithProducts } from '@shared-types/api';
import { useEffect, useState } from 'react';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function Home() {
  const [highlightedProducts, setHighlightedProducts] =
    useState<TopPriceUpdatesWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      try {
        const products = await fetchGlobalPriceUpdatesApi();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />

      <div className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Popular Products
        </h1>

        {/* Carousel for popular products */}
        <div className="w-full max-w-5xl">
          <ProductCarousel />
        </div>
      </div>

      {highlightedProducts && (
        <>
          <div className="flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-8 text-primary">
              Price Decreases
            </h1>
            {/* Carousel for price decreases */}
            <div className="w-full max-w-5xl">
              <ProductCarousel productList={highlightedProducts.topDiscounts} />
            </div>
          </div>

          <div className="flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-8 text-primary">
              Price Increases
            </h1>
            {/* Carousel for price increases */}
            <div className="w-full max-w-5xl">
              <ProductCarousel productList={highlightedProducts.topIncreases} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
