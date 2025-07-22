import axios from 'axios';
import { Todo, TodoFormData, TodoResponse } from '@/types/todo';
import { mockTodoApi } from './mockData';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : 'api';

// Use mock data instead of real API
const USE_MOCK_DATA = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Status:', error.response?.status);
    return Promise.reject(error);
  }
);

export const todoApi = {
  // get todos with filters and pagination
  getTodos: async (params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}): Promise<TodoResponse> => {
    if (USE_MOCK_DATA) {
      return mockTodoApi.getTodos(params);
    }

    // sortBy parameter to API request
    const response = await api.get('/todos', { 
      params: {
        ...params,
        sortBy: 'dueDate',
      } 
    });
    return response.data;
  },

  // Create new todo
  createTodo: async (todoData: TodoFormData): Promise<Todo> => {
    if (USE_MOCK_DATA) {
      return mockTodoApi.createTodo(todoData);
    }

    const response = await api.post('/todos', todoData);
    return response.data;
  },

  // Update todo
  updateTodo: async (id: string, todoData: Partial<TodoFormData & { completed: boolean }>): Promise<Todo> => {
    if (USE_MOCK_DATA) {
      return mockTodoApi.updateTodo(id, todoData);
    }

    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return mockTodoApi.deleteTodo(id);
    }

    await api.delete(`/todos/${id}`);
  },
};