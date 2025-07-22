import { Todo, TodoResponse } from '@/types/todo';

// Mock data storage
let mockTodos: Todo[] = [
  {
    _id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the todo management system including API endpoints and user guide.',
    completed: false,
    dueDate: '2025-01-20T00:00:00.000Z',
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    _id: '2',
    title: 'Review code changes',
    description: 'Review pull requests and provide feedback on the new features.',
    completed: true,
    dueDate: '2025-01-16T00:00:00.000Z',
    createdAt: '2025-01-14T14:20:00.000Z',
    updatedAt: '2025-01-16T09:15:00.000Z'
  },
  {
    _id: '3',
    title: 'Prepare presentation slides',
    description: 'Create slides for the quarterly team meeting presentation.',
    completed: false,
    dueDate: '2025-01-25T00:00:00.000Z',
    createdAt: '2025-01-13T16:45:00.000Z',
    updatedAt: '2025-01-13T16:45:00.000Z'
  },
  {
    _id: '4',
    title: 'Update dependencies',
    description: 'Update all npm packages to their latest stable versions.',
    completed: true,
    dueDate: '2025-01-12T00:00:00.000Z',
    createdAt: '2025-01-10T11:00:00.000Z',
    updatedAt: '2025-01-12T15:30:00.000Z'
  },
  {
    _id: '5',
    title: 'Fix responsive design issues',
    description: 'Address mobile layout problems on the dashboard page.',
    completed: false,
    dueDate: '2025-01-22T00:00:00.000Z',
    createdAt: '2025-01-15T13:20:00.000Z',
    updatedAt: '2025-01-15T13:20:00.000Z'
  },
  {
    _id: '6',
    title: 'Database backup',
    description: 'Perform weekly database backup and verify integrity.',
    completed: false,
    dueDate: '2025-01-18T00:00:00.000Z',
    createdAt: '2025-01-11T09:00:00.000Z',
    updatedAt: '2025-01-11T09:00:00.000Z'
  },
  {
    _id: '7',
    title: 'Team meeting preparation',
    description: 'Prepare agenda and materials for the upcoming team meeting.',
    completed: true,
    dueDate: '2025-01-15T00:00:00.000Z',
    createdAt: '2025-01-12T10:15:00.000Z',
    updatedAt: '2025-01-15T08:45:00.000Z'
  },
  {
    _id: '8',
    title: 'Security audit',
    description: 'Conduct security review of the authentication system.',
    completed: false,
    dueDate: '2025-01-30T00:00:00.000Z',
    createdAt: '2025-01-14T15:30:00.000Z',
    updatedAt: '2025-01-14T15:30:00.000Z'
  }
];

let nextId = 9;

// Helper function to generate new ID
const generateId = (): string => {
  return (nextId++).toString();
};

// Helper function to filter todos
const filterTodos = (todos: Todo[], search: string, status: string): Todo[] => {
  let filtered = [...todos];

  // Apply search filter
  if (search.trim()) {
    const searchLower = search.toLowerCase().trim();
    filtered = filtered.filter(todo => 
      todo.title.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (status === 'completed') {
    filtered = filtered.filter(todo => todo.completed);
  } else if (status === 'incomplete') {
    filtered = filtered.filter(todo => !todo.completed);
  }

  return filtered;
};

// Helper function to paginate todos
const paginateTodos = (todos: Todo[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTodos = todos.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(todos.length / limit);
  
  return {
    todos: paginatedTodos,
    pagination: {
      currentPage: page,
      totalPages,
      totalTodos: todos.length,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

// Mock API functions
export const mockTodoApi = {
  // Get todos with filters and pagination
  getTodos: async (params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<TodoResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 10
    } = params;

    // Sort by creation date (newest first)
    const sortedTodos = [...mockTodos].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply filters
    const filteredTodos = filterTodos(sortedTodos, search, status);

    // Apply pagination
    const result = paginateTodos(filteredTodos, page, limit);

    return result;
  },

  // Create new todo
  createTodo: async (todoData: {
    title: string;
    description: string;
    dueDate: string;
  }): Promise<Todo> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate required fields
    if (!todoData.title?.trim()) {
      throw new Error('Title is required');
    }

    if (!todoData.dueDate) {
      throw new Error('Due date is required');
    }

    const now = new Date().toISOString();
    const newTodo: Todo = {
      _id: generateId(),
      title: todoData.title.trim(),
      description: todoData.description?.trim() || '',
      completed: false,
      dueDate: new Date(todoData.dueDate).toISOString(),
      createdAt: now,
      updatedAt: now
    };

    mockTodos.unshift(newTodo); // Add to beginning of array
    return newTodo;
  },

  // Update todo
  updateTodo: async (id: string, updates: {
    title?: string;
    description?: string;
    completed?: boolean;
    dueDate?: string;
  }): Promise<Todo> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const todoIndex = mockTodos.findIndex(todo => todo._id === id);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    const existingTodo = mockTodos[todoIndex];
    const updatedTodo: Todo = {
      ...existingTodo,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Validate title if provided
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error('Title cannot be empty');
    }

    // Update title and description if provided
    if (updates.title !== undefined) {
      updatedTodo.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updatedTodo.description = updates.description.trim();
    }
    if (updates.dueDate !== undefined) {
      updatedTodo.dueDate = new Date(updates.dueDate).toISOString();
    }

    mockTodos[todoIndex] = updatedTodo;
    return updatedTodo;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const todoIndex = mockTodos.findIndex(todo => todo._id === id);
    
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }

    mockTodos.splice(todoIndex, 1);
  }
};