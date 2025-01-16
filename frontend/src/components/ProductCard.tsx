'use client';

import React from 'react';
import { DBProduct } from '@shared-types/db';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { HeartIcon } from '@/components/HeartIcon';
import Link from 'next/link';

export interface PriceUpdateInfo {
  oldPrice: number;
  showPriceUpdateAsPercentage: boolean;
}

interface ProductCardProps {
  product: DBProduct;
  lazyLoadImg?: boolean;
  priceUpdate?: PriceUpdateInfo;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lazyLoadImg = true,
  priceUpdate,
}) => {
  const { oldPrice, showPriceUpdateAsPercentage } = priceUpdate || {};
  const priceDifferencePercentage = oldPrice
    ? (((product.current_price - oldPrice) / oldPrice) * 100).toFixed(2)
    : null;
  const priceDifferenceRaw = oldPrice
    ? (product.current_price - oldPrice).toFixed(2)
    : null;
  const isDiscount = oldPrice && product.current_price < oldPrice;

  return (
    <Card className="relative w-full flex flex-col bg-card text-card-foreground border-2 border-border rounded-xl overflow-hidden h-[400px] sm:h-[350px]">
      {/* Heart Icon remains interactive and outside links */}
      <div>
        <HeartIcon product={product} />
      </div>

      {/* Image Section */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-48 w-full bg-white flex items-center justify-center p-6">
          <img
            src={product.image_url || '/images/product_placeholder.jpeg'}
            alt={product.product_name}
            className="rounded-md w-full h-full object-contain"
            loading={lazyLoadImg ? 'lazy' : 'eager'}
          />
        </div>
      </Link>

      {/* Header and Description */}
      <div className="p-4">
        <CardHeader className="p-0">
          <CardTitle className="text-primary text-base font-semibold sm:mb-1 leading-snug">
            {product.product_name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {product.product_size}
          </CardDescription>
        </CardHeader>
      </div>

      {/* Price Section Positioned at the Bottom */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="absolute bottom-0 left-0 right-0 bg-card p-4">
          <CardContent className="flex flex-col justify-end p-0">
            <div className="flex items-center justify-between">
              <p className="text-primary font-bold text-lg mb-2">
                ${product.current_price.toFixed(2)}
              </p>
              {priceUpdate && oldPrice && (
                <div
                  className={`text-sm font-semibold ${
                    isDiscount ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isDiscount ? '-' : '+'}
                  {showPriceUpdateAsPercentage
                    ? `${Math.abs(Number(priceDifferencePercentage))}%`
                    : `$${Math.abs(Number(priceDifferenceRaw)).toFixed(2)}`}
                </div>
              )}
            </div>
            {priceUpdate && oldPrice && (
              <p className="text-muted-foreground text-sm line-through">
                ${oldPrice.toFixed(2)}
              </p>
            )}
          </CardContent>
        </div>
      </Link>
    </Card>
  );
};
