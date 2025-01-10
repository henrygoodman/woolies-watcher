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
    product_name: 'Woolworths RSPCA Approved Chicken Breast Fillet',
    url: 'https://www.woolworths.com.au/shop/productdetails/25734',
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
  const [products, setProducts] = useState<
    { product: DBProduct; old_price?: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await Promise.all(
          productIdentifiers.map(({ product_name, url }) =>
            fetchProductByNameAndUrlApi(product_name, url)
          )
        );
        const mappedProducts = fetchedProducts.map((product) => ({
          product,
        }));
        setProducts(mappedProducts);
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
        isPriceUpdateWithProduct(item)
          ? { product: item.product, old_price: item.old_price }
          : { product: item }
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
      <Carousel className="overflow-visible p-4">
        <CarouselContent className="-ml-4 sm:-ml-8">
          {products.map(({ product, old_price }) => (
            <CarouselItem
              key={product.id}
              className="basis-full sm:basis-1/3 pl-4 sm:pl-8"
            >
              <ProductCard
                product={product}
                priceUpdate={
                  old_price
                    ? { oldPrice: old_price, showPriceUpdateAsPercentage: true }
                    : undefined
                }
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
