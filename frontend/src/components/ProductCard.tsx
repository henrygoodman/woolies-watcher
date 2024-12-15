'use client';

import { Product } from '@shared-types/api';
import Image from 'next/image';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist } from '@/lib/api/watchlistApi';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleWatchlist = async () => {
    if (!isLoggedIn) {
      console.warn('User must be logged in to modify the watchlist.');
      return;
    }

    setLoading(true);

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(product.id);
        console.log(`Removed product ${product.id} from watchlist.`);
      } else {
        await addToWatchlist(product.id);
        console.log(`Added product ${product.id} to watchlist.`);
      }
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-card text-card-foreground border border-border rounded-lg shadow-md overflow-hidden flex flex-col relative">
      {/* Heart Icon */}
      {isLoggedIn && (
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2 left-2 p-1 rounded-full bg-white shadow hover:bg-muted transition-colors z-10 ${
            loading ? 'cursor-wait' : ''
          }`}
          aria-label={
            isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'
          }
          disabled={loading} // Prevent multiple clicks during API call
        >
          {isInWatchlist ? (
            <Heart fill="white" className="text-destructive h-5 w-5" />
          ) : (
            <Heart className="text-muted-foreground h-5 w-5" />
          )}
        </button>
      )}

      {/* Clickable Image Container */}
      <a
        href={product.url}
        target="_blank"
        rel="noreferrer"
        className="relative w-full bg-white flex items-center justify-center p-4"
      >
        <div className="relative h-40 w-full">
          <Image
            src={product.image_url || '/images/product_placeholder.jpeg'}
            alt={product.product_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'contain',
            }}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </a>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between py-2">
        {/* Title and Quantity */}
        <div className="flex flex-col gap-1 min-h-[4.5rem]">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-primary text-base font-semibold line-clamp-2">
              {product.product_name}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {product.product_size}
            </CardDescription>
          </CardHeader>
        </div>

        {/* Price, Brand, and Link */}
        <div className="flex flex-col items-start gap-2">
          <CardContent className="flex flex-col">
            <p className="text-accent font-bold">
              ${product.current_price.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-sm">
              {product.product_brand}
            </p>
          </CardContent>
          <CardFooter>
            <a
              href={product.url}
              target="_blank"
              className="text-primary font-semibold hover:underline hover:text-primary-foreground"
              rel="noreferrer"
            >
              View Product
            </a>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
