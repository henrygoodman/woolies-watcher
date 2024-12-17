'use client';

import { DBProduct } from '@shared-types/db';
import Image from 'next/image';
import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProductCardProps {
  product: DBProduct;
  isInWatchlist: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWatchlist: initialWatchlistState,
}) => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [isInWatchlist, setIsInWatchlist] = useState(initialWatchlistState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsInWatchlist(initialWatchlistState);
  }, [initialWatchlistState]);

  const toggleWatchlist = async () => {
    if (!isLoggedIn) {
      console.warn('User must be logged in to modify the watchlist.');
      return;
    }

    setLoading(true);

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(product.id);
        toast({
          title: 'Removed from Watchlist',
          description: `${product.product_name} has been removed from your watchlist.`,
          variant: 'destructive',
        });
      } else {
        await addToWatchlist(product.id);
        toast({
          title: 'Added to Watchlist',
          description: (
            <span>
              <span>
                {product.product_name} has been added to your watchlist.{' '}
              </span>
              <Link href="/dashboard" className="text-primary underline">
                View Watchlist
              </Link>
            </span>
          ),
        });
      }
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative w-full bg-card text-card-foreground border border-border flex flex-col rounded-xl overflow-hidden">
      {/* Heart Icon */}
      {isLoggedIn && (
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2 left-2 p-1 rounded-full bg-white hover:bg-muted transition-colors z-10 ${
            loading ? 'cursor-wait' : ''
          }`}
          aria-label={
            isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'
          }
          disabled={loading}
          style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} // Remove border, add subtle shadow
        >
          {isInWatchlist ? (
            <Heart fill="red" className="text-destructive h-5 w-5" />
          ) : (
            <Heart className="text-muted-foreground h-5 w-5" />
          )}
        </button>
      )}

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
