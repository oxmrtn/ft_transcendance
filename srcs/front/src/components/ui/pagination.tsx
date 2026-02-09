import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "lucide-react"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className="p-2 rounded-md text-sm font-medium transition-colors bg-white/10 border border-white/10 text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-default disabled:hover:bg-white/10"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <span className="text-white font-medium font-mono">
        {currentPage}/{totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className="p-2 rounded-md text-sm font-medium transition-colors bg-white/10 border border-white/10 text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-defaut disabled:hover:bg-white/10"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
