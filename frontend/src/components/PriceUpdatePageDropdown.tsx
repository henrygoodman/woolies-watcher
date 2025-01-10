'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function PriceUpdatePageDropdown({
  sortRaw,
  onSortChange,
}: {
  sortRaw: boolean;
  onSortChange: (value: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="btn btn-primary flex items-center">
        Sort By
        <ChevronDown className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onSortChange(false)}
          className={`${!sortRaw ? 'text-primary' : ''}`}
        >
          Percentage %
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange(true)}
          className={`${sortRaw ? 'text-primary' : ''}`}
        >
          Dollar (AUD)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
