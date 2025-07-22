'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TodoPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  isLoading?: boolean;
}

export function TodoPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false
}: TodoPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      const adjustedStart = Math.max(1, end - maxVisible + 1);
      
      for (let i = adjustedStart; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Show</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-16 h-8 border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span>per page</span>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600 font-medium">
        Showing {startItem}-{endItem} of {totalItems} items
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || isLoading}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous page */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex gap-1 mx-2">
          {getVisiblePages().map((page) => (
            <Button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              size="sm"
              variant={page === currentPage ? 'default' : 'outline'}
              className={`h-8 min-w-8 px-2 text-sm font-medium transition-colors duration-200 ${
                page === currentPage
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Next page */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page */}
        <Button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}