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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
}) => {
  const renderPaginationLinks = () => {
    const maxPagesToShow = 3;
    const pages = [];

    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    const adjustedStartPage = Math.max(1, endPage - maxPagesToShow + 1);

    if (adjustedStartPage > 1) {
      pages.push(
        <PaginationItem key="start">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPrevious();
            }}
            className="text-primary hover:text-primary-foreground"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (adjustedStartPage > 2) {
        pages.push(<PaginationEllipsis key="start-ellipsis" />);
      }
    }

    for (let page = adjustedStartPage; page <= endPage; page++) {
      pages.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page !== currentPage) {
                if (page > currentPage) {
                  onNext();
                } else {
                  onPrevious();
                }
              }
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
              onNext();
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
    <ShadcnPagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPrevious();
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
              if (currentPage < totalPages) onNext();
            }}
            className="text-primary hover:text-primary-foreground"
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};
