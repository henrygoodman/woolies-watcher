'use client';

import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  onNext: () => void | Promise<void>;
  onPrevious: () => void | Promise<void>;
  onPerPageChange: (value: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  perPage,
  onNext,
  onPrevious,
  onPerPageChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPerPage, setSelectedPerPage] = useState(perPage);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const perPageFromQuery = searchParams.get('perPage');
    if (perPageFromQuery) {
      setSelectedPerPage(parseInt(perPageFromQuery, 10));
    }
  }, [searchParams]);

  const updateQueryParams = (params: Record<string, string | number>) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      currentParams.set(key, value.toString());
    });
    router.push(`?${currentParams.toString()}`);
  };

  const handlePerPageChange = (value: string) => {
    const perPageValue = parseInt(value, 10);
    setSelectedPerPage(perPageValue);
    updateQueryParams({ perPage: perPageValue, page: 1 });
    onPerPageChange(perPageValue);
  };

  const renderPaginationLinks = () => {
    if (isSmallScreen) {
      return (
        <>
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                updateQueryParams({ page: 1 });
              }}
              className={`${
                currentPage === 1 ? 'font-bold text-primary' : 'text-muted'
              }`}
            >
              1
            </PaginationLink>
          </PaginationItem>
          {/* Only show the current page if it's not the first or last */}
          {currentPage > 2 && <PaginationEllipsis />}
          {currentPage > 1 && currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  updateQueryParams({ page: currentPage });
                }}
                className="font-bold text-primary"
              >
                {currentPage}
              </PaginationLink>
            </PaginationItem>
          )}
          {currentPage < totalPages - 1 && <PaginationEllipsis />}
          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  updateQueryParams({ page: totalPages });
                }}
                className={`${
                  currentPage === totalPages
                    ? 'font-bold text-primary'
                    : 'text-muted'
                }`}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
        </>
      );
    }

    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(
      totalPages,
      currentPage + Math.floor(maxPagesToShow / 2)
    );

    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="start">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateQueryParams({ page: 1 });
            }}
            className="text-primary hover:text-primary-foreground"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="start-ellipsis" />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateQueryParams({ page });
            }}
            className={`${
              page === currentPage
                ? 'font-bold text-primary'
                : 'text-foreground hover:text-primary'
            }`}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      pages.push(
        <PaginationItem key="end">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateQueryParams({ page: totalPages });
            }}
            className="text-primary hover:text-primary-foreground"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <ShadcnPagination className="mt-8 flex items-center justify-between w-full">
      <div className="w-[120px]" />

      <PaginationContent className="flex items-center justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                updateQueryParams({ page: currentPage - 1 });
                onPrevious();
              }
            }}
            className="text-primary hover:text-primary-foreground"
          />
        </PaginationItem>

        {renderPaginationLinks()}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                updateQueryParams({ page: currentPage + 1 });
                onNext();
              }
            }}
            className="text-primary hover:text-primary-foreground"
          />
        </PaginationItem>
      </PaginationContent>

      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">Items per page:</p>
        <Select
          value={selectedPerPage.toString()}
          onValueChange={handlePerPageChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={`${selectedPerPage}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ShadcnPagination>
  );
};
