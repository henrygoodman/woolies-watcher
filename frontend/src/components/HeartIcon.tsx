import { useState } from 'react';
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

  const [showAlert, setShowAlert] = useState(false);

  const handleClick = async () => {
    if (!isLoggedIn) {
      setShowAlert(true);
      return;
    }

    const previousState = isInWatchlist;

    try {
      await toggleWatchlist();
      if (onToggle) {
        onToggle(!previousState);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`absolute top-2 left-2 p-1 rounded-full bg-white hover:bg-muted transition-colors shadow-md z-10`}
        style={{
          width: '2rem',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={
          isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'
        }
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
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
