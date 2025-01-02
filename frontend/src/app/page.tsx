'use client';

import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {!session && <HeroSection />}

      <div className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Popular Products
        </h1>

        {/* Carousel Component */}
        <div className="w-full max-w-5xl">
          <ProductCarousel />
        </div>
      </div>

      <div className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Price Decreases
        </h1>
      </div>

      <div className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Price Increases
        </h1>
      </div>
    </div>
  );
}
