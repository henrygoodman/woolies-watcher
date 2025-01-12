import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface HeartIconProps {
  isChecked: boolean;
  onToggle: (newState: boolean) => Promise<void>;
  ariaLabel?: { checked: string; unchecked: string };
}

export const HeartIcon: React.FC<HeartIconProps> = ({
  isChecked,
  onToggle,
  ariaLabel = {
    checked: 'Remove from watchlist',
    unchecked: 'Add to watchlist',
  },
}) => {
  const [checked, setChecked] = useState(isChecked);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading

    const newState = !checked;
    setChecked(newState); // Optimistic update

    try {
      setIsLoading(true);
      await onToggle(newState);
    } catch (error) {
      console.error('Error toggling state:', error);
      setChecked(!newState); // Revert state on failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 left-2  p-1 rounded-full bg-white hover:bg-muted transition-colors shadow-md z-10 ${
        isLoading ? 'cursor-not-allowed' : ''
      }`}
      style={{
        width: '2rem',
        height: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={checked ? ariaLabel.checked : ariaLabel.unchecked}
      disabled={isLoading} // Prevent further clicks while loading
    >
      <Heart
        fill={checked ? 'red' : 'none'}
        className={`h-5 w-5 ${
          checked ? 'text-destructive' : 'text-muted-foreground'
        }`}
      />
    </button>
  );
};
