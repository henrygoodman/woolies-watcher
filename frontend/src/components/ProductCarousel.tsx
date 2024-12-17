'use client';

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ProductCard } from '@/components/ProductCard';
import { type DBProduct } from '@shared-types/db';

const products: DBProduct[] = [
  {
    id: 1,
    barcode: null,
    last_updated: '',
    product_name: 'Product 1',
    product_brand: 'Brand A',
    current_price: 10.99,
    product_size: '500g',
    image_url: '/images/product_placeholder.jpeg',
    url: '#',
  },
  {
    id: 2,
    barcode: null,
    last_updated: '',
    product_name: 'Product 2',
    product_brand: 'Brand B',
    current_price: 12.99,
    product_size: '1kg',
    image_url: '/images/product_placeholder.jpeg',
    url: '#',
  },
  {
    id: 3,
    barcode: null,
    last_updated: '',
    product_name: 'Product 3',
    product_brand: 'Brand C',
    current_price: 15.99,
    product_size: '750g',
    image_url: '/images/product_placeholder.jpeg',
    url: '#',
  },
  {
    id: 4,
    barcode: null,
    last_updated: '',
    product_name: 'Product 4',
    product_brand: 'Brand D',
    current_price: 9.99,
    product_size: '400g',
    image_url: '/images/product_placeholder.jpeg',
    url: '#',
  },
  {
    id: 5,
    barcode: null,
    last_updated: '',
    product_name: 'Product 5',
    product_brand: 'Brand E',
    current_price: 19.99,
    product_size: '1.2kg',
    image_url: '/images/product_placeholder.jpeg',
    url: '#',
  },
];

export const ProductCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      console.log('Slide selected:', api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full relative px-4 sm:px-8">
      {' '}
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        className="overflow-visible p-4"
      >
        <CarouselContent className="-ml-4 sm:-ml-8">
          {' '}
          {/* Adjust for padding */}
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-full sm:basis-1/3 pl-4 sm:pl-8"
            >
              <ProductCard product={product} isInWatchlist={false} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
