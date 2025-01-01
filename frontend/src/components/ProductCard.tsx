'use client';

import { DBProduct } from '@shared-types/db';
import Image from 'next/image';
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
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="relative w-full flex flex-col bg-card text-card-foreground border border-border rounded-xl overflow-hidden h-full">
      <HeartIcon product={product} />

      <Link href={`/product/${product.id}`}>
        <div className="relative h-64 w-full bg-white flex items-center justify-center p-8">
          <div className="relative w-full h-full">
            <Image
              src={product.image_url || '/images/product_placeholder.jpeg'}
              alt={product.product_name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-md object-contain"
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

        {/* Price and Footer */}
        <CardContent className="flex-1 flex flex-col justify-end p-0 mt-2">
          <p className="text-primary font-bold text-lg mb-2">
            ${product.current_price.toFixed(2)}
          </p>
          <CardFooter className="p-0">
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
