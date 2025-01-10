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

interface ProductCardProps {
  product: DBProduct;
  oldPrice?: number; // Optional old price prop
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  oldPrice,
}) => {
  // Calculate the price change percentage if oldPrice is provided
  const priceDifference = oldPrice
    ? (((product.current_price - oldPrice) / oldPrice) * 100).toFixed(2)
    : null;

  const isDiscount = oldPrice && product.current_price < oldPrice; // Check if it's a discount

  console.log('Mounted', product);
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

            {oldPrice && (
              <div
                className={`text-sm font-semibold ${
                  isDiscount ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isDiscount ? '-' : '+'}
                {Math.abs(Number(priceDifference))}%
              </div>
            )}
          </div>

          {oldPrice && (
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
