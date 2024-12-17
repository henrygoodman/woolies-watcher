'use client';

import { DBProduct } from '@shared-types/db';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useWatchlist } from '@/hooks/useWatchlist';

interface ProductCardProps {
  product: DBProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWatchlist, toggleWatchlist, watchlistLoading } = useWatchlist(
    product.id!
  );

  return (
    <Card className="relative w-full bg-card text-card-foreground border border-border flex flex-col rounded-xl overflow-hidden">
      {/* Heart Icon */}
      <button
        onClick={() => toggleWatchlist(product.product_name)}
        className={`absolute top-2 left-2 p-1 rounded-full bg-white hover:bg-muted transition-colors z-10 ${
          watchlistLoading ? 'cursor-wait opacity-70' : ''
        }`}
        aria-label={
          isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'
        }
        disabled={watchlistLoading}
        style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      >
        <Heart
          fill={isInWatchlist ? 'red' : 'none'}
          className={`h-5 w-5 ${
            isInWatchlist ? 'text-destructive' : 'text-muted-foreground'
          }`}
        />
      </button>

      {/* Product Image */}
      <Link
        href={`/product/${product.id}`}
        className="relative w-full bg-white flex items-center justify-center p-4"
      >
        <div className="relative h-40 w-full">
          <Image
            src={product.image_url || '/images/product_placeholder.jpeg'}
            alt={product.product_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-md object-contain"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between py-2">
        <CardHeader>
          <CardTitle className="text-primary text-base font-semibold line-clamp-2">
            {product.product_name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {product.product_size}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-accent font-bold">
            ${product.current_price.toFixed(2)}
          </p>
          <p className="text-muted-foreground text-sm">
            {product.product_brand}
          </p>
        </CardContent>
        <CardFooter>
          <Link
            href={`/product/${product.id}`}
            className="inline-block w-full text-center bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md transition-all hover:bg-primary/90 focus:outline-none focus:ring focus:ring-primary/70"
          >
            View Product
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};
