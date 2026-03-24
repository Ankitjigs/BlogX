"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems?: number;
  itemLabel?: string;
  className?: string; // Allow custom styling
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  totalItems,
  itemLabel = "items",
  className,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper to generate page numbers
  const generatePagination = () => {
    // If total pages is small, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Determine if we should show ellipsis
    const showLeftEllipsis = currentPage > 3;
    const showRightEllipsis = currentPage < totalPages - 2;

    if (!showLeftEllipsis && showRightEllipsis) {
      // Case 1: 1 2 3 4 5 ... 10
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      // Case 2: 1 ... 6 7 8 9 10
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    // Case 3: 1 ... 4 5 6 ... 10
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = generatePagination();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2",
        className,
      )}
    >
      {/* Summary Text */}
      <div className="text-sm text-muted-foreground">
        {totalItems !== undefined && (
          <>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {Math.min((currentPage - 1) * 10 + 1, totalItems)}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * 10, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span>{" "}
            {itemLabel}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((page, i) =>
          page === "..." ? (
            <div
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </div>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-9 w-9",
                currentPage === page && "pointer-events-none",
              )}
              onClick={() => handlePageChange(page as number)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
