'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { FilterStatus } from '@/types/todo';

interface TodoFiltersProps {
  search: string;
  status: FilterStatus;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onClearFilters: () => void;
  totalCount?: number;
  filteredCount?: number;
}

export function TodoFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClearFilters,
  totalCount = 0,
  filteredCount = 0
}: TodoFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const hasActiveFilters = search.trim() || status !== 'all';
  const isFiltered = filteredCount !== totalCount;

  const getStatusLabel = (status: FilterStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'incomplete':
        return 'Incomplete';
      default:
        return 'All Tasks';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search todos by title..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-colors duration-200"
          />
          {localSearch && (
            <Button
              onClick={() => setLocalSearch('')}
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto w-auto hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-3">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="px-4 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            Showing {filteredCount} of {totalCount} todos
          </span>
          {hasActiveFilters && (
            <span className="text-blue-600 font-medium">
              (filtered by: {getStatusLabel(status)}{search.trim() && `, "${search.trim()}"`})
            </span>
          )}
        </div>
        
        {isFiltered && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
            Filtered
          </span>
        )}
      </div>
    </div>
  );
}