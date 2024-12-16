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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
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
        toast({
          title: 'Removed from Watchlist',
          description: `${product.product_name} has been removed from your watchlist.`,
          variant: 'destructive',
        });
      } else {
        await addToWatchlist(product.id);
        console.log(`Added product ${product.id} to watchlist.`);
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
            <Heart fill="red" className="text-destructive h-5 w-5" />
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
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            View Product
          </a>
        </CardFooter>
      </div>
    </Card>
  );
};
