'use client';

import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '@/lib/api';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { TodoFilters } from '@/components/TodoFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  CheckSquare, 
  Plus, 
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Todo, TodoResponse, TodoFormData, FilterStatus } from '@/types/todo';

export default function Home() {

  const [todos, setTodos] = useState<TodoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [hasInitialHealthCheck, setHasInitialHealthCheck] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Check if server is online
  const checkServerHealth = useCallback(async () => {
    if (isCheckingHealth) return;
    
    setIsCheckingHealth(true);
    try {
       const healthUrl = process.env.NODE_ENV === 'production'
        ? '/api/health'
        : 'http://localhost:5000/api/health';
        
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), 
      });
      
      if (response.ok) {
        const healthData = await response.json();
        setIsServerOnline(true);
        if (error?.includes('server') || error?.includes('fetch')) {
          setError(null);
        }
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('Server health check failed:', err);
      setIsServerOnline(false);
      if (!error || !error.includes('fetch')) {
        setError('Cannot connect to server. Please check your connection.');
      }
    } finally {
      setIsCheckingHealth(false);
      if (!hasInitialHealthCheck) {
        setHasInitialHealthCheck(true);
      }
    }
  }, [isCheckingHealth, error, hasInitialHealthCheck]);

  // Refresh button
  const handleRefreshServerHealth = useCallback(async () => {
    await checkServerHealth();
  }, [checkServerHealth]);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await todoApi.getTodos({
        search: search.trim(),
        status,
        page: currentPage,
        limit: itemsPerPage,
      });
      
      setTodos(data);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      
      setError(err.message || 'Failed to fetch todos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, currentPage, itemsPerPage]);

  useEffect(() => {
    checkServerHealth();
  }, []); 

  useEffect(() => {
    // Only fetch todos if server is online and initial health check is done
    if (hasInitialHealthCheck && isServerOnline) {
      fetchTodos();
    }
  }, [fetchTodos, hasInitialHealthCheck, isServerOnline]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [search, status]);

  const handleCreateTodo = async (formData: TodoFormData) => {
    setIsCreating(true);
    try {
      const newTodo = await todoApi.createTodo(formData);
      await fetchTodos();
      setShowCreateForm(false);
      
      toast.success(`Todo "${newTodo.title}" created successfully`, {
        duration: 3000,
      });
    } catch (err: any) {
      console.error('Error creating todo:', err);
      toast.error('Failed to create todo', { 
        duration: 3000,
        description: err.response?.data?.error || err.message 
      });
      throw new Error(err.response?.data?.error || 'Failed to create todo');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      await fetchTodos(); 
      
      if ('completed' in updates) {
        const status = updates.completed ? 'completed' : 'reopened';
        toast.success(`Todo marked as ${status}`, { duration: 3000 });
      } else {
        toast.success(`Todo "${updatedTodo.title}" updated`, { duration: 3000 });
      }
    } catch (err: any) {
      console.error('Error updating todo:', err);
      toast.error('Failed to update todo', { 
        duration: 1000,
        description: err.response?.data?.error || err.message 
      });
      throw new Error(err.response?.data?.error || 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const todoToDelete = todos?.todos.find(t => t._id === id);
      
      await todoApi.deleteTodo(id);
      await fetchTodos();
      
      toast.success(`Todo ${todoToDelete?.title ? `"${todoToDelete.title}"` : ''} deleted`, {
        duration: 1000
      });
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      toast.error('Failed to delete todo', { 
        duration: 3000,
        description: err.response?.data?.error || err.message 
      });
      throw new Error(err.response?.data?.error || 'Failed to delete todo');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Todo Manager
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Organize your tasks efficiently with our comprehensive todo management system
          </p>
          
          {/* Server Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {!hasInitialHealthCheck ? (
              <>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <span className="text-sm text-gray-500">Checking server status...</span>
              </>
            ) : (
              <>
                <div className={`w-2 h-2 rounded-full ${isServerOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${isServerOnline ? 'text-green-600' : 'text-red-600'}`}>
                  Server {isServerOnline ? 'Online' : 'Offline'}
                </span>
              </>
            )}
            <Button
              onClick={handleRefreshServerHealth}
              size="sm"
              variant="ghost"
              className="p-1 h-auto"
              disabled={isCheckingHealth}
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Server Connection Error */}
        {hasInitialHealthCheck && !isServerOnline && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p className="font-medium">Backend server is not running!</p>
                <p className="text-sm">
                  To start the server, run: <code className="bg-red-100 px-2 py-1 rounded">npm run server</code> or <code className="bg-red-100 px-2 py-1 rounded">npm run dev:full</code> to run both frontend and backend.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Create Todo Form */}
        {showCreateForm && (
          <div className="mb-8">
            <TodoForm
              onSubmit={handleCreateTodo}
              isLoading={isCreating}
              onCancel={() => setShowCreateForm(false)}
            />
            <Separator className="mt-8" />
          </div>
        )}

        {/* Create Todo Button */}
        {!showCreateForm && (
          <Card className="mb-6 shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 text-lg"
                disabled={!isServerOnline || !hasInitialHealthCheck}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Todo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {hasInitialHealthCheck && isServerOnline && (
          <div className="mb-6">
            <TodoFilters
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onClearFilters={handleClearFilters}
              totalCount={todos?.pagination.totalTodos}
              filteredCount={todos?.todos.length}
            />
          </div>
        )}

        {/* Todo List */}
        {hasInitialHealthCheck && (
          <TodoList
            data={todos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPage={itemsPerPage}
            isLoading={isLoading}
            error={error}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Built with Next.js, Express.js, and MongoDB</p>
        </div>
      </div>
    </div>
  );
}