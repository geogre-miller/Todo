export interface Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFormData {
  title: string;
  description: string;
  dueDate: string;
}

export interface TodoResponse {
  todos: Todo[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTodos: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  error: string;
}

export type FilterStatus = 'all' | 'completed' | 'incomplete';