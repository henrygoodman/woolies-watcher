'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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
    <div className="container mx-auto relative">
      <Carousel className="overflow-x-auto scroll-smooth">
        {/* Slightly reduce padding */}
        <CarouselContent className="flex gap-4 px-6 sm:px-10">
          {products.map(({ product, old_price }) => (
            <CarouselItem
              key={product.id}
              className="
              flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] 2xl:flex-[0_0_20%]
              max-w-[85%] sm:max-w-1/2 lg:max-w-1/3 xl:max-w-1/4 2xl:max-w-1/5
              flex-shrink-0
            "
            >
              <ProductCard
                product={product}
                priceUpdate={
                  old_price
                    ? { oldPrice: old_price, showPriceUpdateAsPercentage: true }
                    : undefined
                }
                lazyLoadImg={false}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
