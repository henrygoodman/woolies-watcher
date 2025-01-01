'use client';

import { HeroSection } from '@/components/HeroSection';
import { ProductCarousel } from '@/components/ProductCarousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />

      <div className="flex flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          Popular Products
        </h1>

        {/* Carousel Component */}
        <div className="w-full max-w-5xl">
          <ProductCarousel />
        </div>
      </div>
    </div>
  );
}
