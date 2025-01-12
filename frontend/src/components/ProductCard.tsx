'use client';

import { DBProduct } from '@shared-types/db';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { HeartIcon } from '@/components/HeartIcon';

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

  // Calculate the price change percentage or dollar amount if oldPrice is provided
  const priceDifferencePercentage = oldPrice
    ? (((product.current_price - oldPrice) / oldPrice) * 100).toFixed(2)
    : null;

  const priceDifferenceRaw = oldPrice
    ? (product.current_price - oldPrice).toFixed(2)
    : null;

  const isDiscount = oldPrice && product.current_price < oldPrice; // Check if it's a discount

  return (
    <Card className="relative w-full flex flex-col bg-card text-card-foreground border border-border rounded-xl overflow-hidden h-full">
      <HeartIcon product={product} />

      <Link href={`/product/${product.id}`}>
        <div className="relative h-64 w-full bg-white flex items-center justify-center p-4">
          <div className="relative w-full h-full p-4 bg-white flex items-center justify-center">
            <img
              src={product.image_url || '/images/product_placeholder.jpeg'}
              alt={product.product_name}
              className="rounded-md"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              loading={lazyLoadImg ? 'lazy' : 'eager'}
            />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <CardHeader className="p-0">
          <CardTitle className="text-primary text-base font-semibold mb-1 leading-snug">
            {product.product_name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {product.product_size}
          </CardDescription>
        </CardHeader>

        {/* Price and Discount Info */}
        <CardContent className="flex-1 flex flex-col justify-end p-0 mt-2">
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

          <CardFooter className="p-0 mt-2">
            <Link
              href={`/product/${product.id}`}
              className="w-full text-center bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md transition-all hover:bg-primary/90"
            >
              View Product
            </Link>
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  );
};
