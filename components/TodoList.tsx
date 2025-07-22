'use client';

import { TodoItem } from './TodoItem';
import { TodoPagination } from './TodoPagination';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ListTodo } from 'lucide-react';
import { Todo, TodoResponse } from '@/types/todo';
import { parseISO, isValid } from 'date-fns';

interface TodoListProps {
  data: TodoResponse | null;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPage: number;
  isLoading?: boolean;
  error?: string | null;
}

export function TodoList({
  data,
  onUpdate,
  onDelete,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPage,
  isLoading = false,
  error = null
}: TodoListProps) {
  
  // Sort todos by due date (closest first)
  const sortedTodos = data?.todos ? [...data.todos].sort((a, b) => {
    // Handle null/undefined due dates
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1; // b comes first if a has no due date
    if (!b.dueDate) return -1; // a comes first if b has no due date
    
    // Parse dates safely
    const dateA = parseISO(a.dueDate);
    const dateB = parseISO(b.dueDate);
    
    // Validate dates and compare
    if (!isValid(dateA) && !isValid(dateB)) return 0;
    if (!isValid(dateA)) return 1;
    if (!isValid(dateB)) return -1;
    
    // Sort completed items last
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // For items with same completion status, sort by due date
    return dateA.getTime() - dateB.getTime();
  }) : [];
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-300 rounded w-24"></div>
                      <div className="h-6 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Failed to Load Todos
              </h3>
              <p className="text-gray-600 max-w-md">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!data) {
    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Loading Todos...
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch your todos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (data.todos.length === 0) {
    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {data.pagination.totalTodos === 0 
                  ? "No todos yet" 
                  : "No todos match your filters"
                }
              </h3>
              <p className="text-gray-600 max-w-md">
                {data.pagination.totalTodos === 0
                  ? "Create your first todo to get started with organizing your tasks."
                  : "Try adjusting your search criteria or filters to see more todos."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Todos list
  return (
    <div className="space-y-6">
      {/* Sort indicator - Add this near the top of your todo list display */}
      {sortedTodos.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 px-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up">
            <path d="M12 19V5"/>
            <path d="m5 12 7-7 7 7"/>
          </svg>
          <span>Sorted by closest due date</span>
        </div>
      )}

      {/* Todo Items - now using sortedTodos */}
      <div className="space-y-4">
        {sortedTodos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Pagination */}
      <TodoPagination
        currentPage={data.pagination.currentPage}
        totalPages={data.pagination.totalPages}
        totalItems={data.pagination.totalTodos}
        itemsPerPage={itemsPerPage}
        hasNextPage={data.pagination.hasNextPage}
        hasPrevPage={data.pagination.hasPrevPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        isLoading={isLoading}
      />
    </div>
  );
}