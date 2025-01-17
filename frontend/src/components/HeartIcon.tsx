import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { signIn, useSession } from 'next-auth/react';
import { DBProduct } from '@shared-types/db';
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
  product: DBProduct;
  onToggle?: (isInWatchlist: boolean) => void;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ product, onToggle }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist(product);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Local optimistic state
  const [optimisticInWatchlist, setOptimisticInWatchlist] =
    useState(isInWatchlist);

  // Sync optimistic state when external isInWatchlist changes
  useEffect(() => {
    setOptimisticInWatchlist(isInWatchlist);
  }, [isInWatchlist]);

  const handleClick = async () => {
    if (isLoading) return;

    if (!isLoggedIn) {
      setShowAlert(true);
      return;
    }

    const previousState = optimisticInWatchlist;
    // Optimistically update UI
    const newState = !previousState;
    setOptimisticInWatchlist(newState);
    if (onToggle) {
      onToggle(newState);
    }

    try {
      setIsLoading(true);
      // Attempt to toggle watchlist on server
      await toggleWatchlist();
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      // Revert optimistic update on failure
      setOptimisticInWatchlist(previousState);
      if (onToggle) {
        onToggle(previousState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`absolute top-2 left-2 p-1 rounded-full bg-white hover:bg-muted transition-colors z-10 ${
          isLoading ? 'cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
        aria-label={
          optimisticInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'
        }
      >
        <Heart
          fill={optimisticInWatchlist ? 'red' : 'none'}
          className={`h-5 w-5 ${
            optimisticInWatchlist ? 'text-destructive' : 'text-muted-foreground'
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
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
