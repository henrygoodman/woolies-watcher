'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { signIn, useSession } from 'next-auth/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface HeartIconProps {
  productId: number;
  productName: string;
}

export const HeartIcon: React.FC<HeartIconProps> = ({
  productId,
  productName,
}) => {
  const { isInWatchlist, toggleWatchlist, watchlistLoading } =
    useWatchlist(productId);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [showAlert, setShowAlert] = useState(false);

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowAlert(true);
      return;
    }
    toggleWatchlist(productName);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`absolute top-2 left-2 p-1 rounded-full bg-white hover:bg-muted transition-colors z-10 ${
          watchlistLoading ? 'cursor-wait opacity-70' : ''
        }`}
        aria-label={
          isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'
        }
        disabled={watchlistLoading}
      >
        <Heart
          fill={isInWatchlist ? 'red' : 'none'}
          className={`h-5 w-5 ${
            isInWatchlist ? 'text-destructive' : 'text-muted-foreground'
          }`}
        />
      </button>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log in Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to use the watchlist feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                signIn('google', { callbackUrl: window.location.href })
              }
              className="text-sm font-medium hover:underline"
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
