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
import { fetchProductByNameAndUrlApi } from '@/lib/api/productApi';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PriceUpdateWithProduct, ProductIdentifier } from '@shared-types/api';

const productIdentifiers: ProductIdentifier[] = [
  {
    product_name: 'Woolworths Lean Beef Mince',
    url: 'https://www.woolworths.com.au/shop/productdetails/577861',
  },
  {
    product_name: 'Woolworths Rspca Chicken Breast Fillets',
    url: 'https://www.woolworths.com.au/shop/productdetails/349091',
  },
  {
    product_name: 'Musashi 100% Whey Protein Vanilla Milkshake Flavour',
    url: 'https://www.woolworths.com.au/shop/productdetails/304171',
  },
  {
    product_name: 'Superior Gold Salmon Smoked',
    url: 'https://www.woolworths.com.au/shop/productdetails/846997',
  },
  {
    product_name: 'Puregg Free Range Liquid Egg White',
    url: 'https://www.woolworths.com.au/shop/productdetails/54278',
  },
];

interface ProductCarouselProps {
  productList?: (DBProduct | PriceUpdateWithProduct)[];
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  productList,
}) => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await Promise.all(
          productIdentifiers.map(({ product_name, url }) =>
            fetchProductByNameAndUrlApi(product_name, url)
          )
        );
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products: ' + err);
      } finally {
        setLoading(false);
      }
    };

    if (productList) {
      const isPriceUpdateWithProduct = (
        product: DBProduct | PriceUpdateWithProduct
      ): product is PriceUpdateWithProduct => 'product' in product;

      const mappedProducts = productList.map((item) =>
        isPriceUpdateWithProduct(item) ? item.product : item
      );
      setProducts(mappedProducts);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [productList]);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="w-full relative px-4 sm:px-8">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 5000, // Carousel delay
          }),
        ]}
        className="overflow-visible p-4"
      >
        <CarouselContent className="-ml-4 sm:-ml-8">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-full sm:basis-1/3 pl-4 sm:pl-8"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
