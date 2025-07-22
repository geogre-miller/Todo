'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Todo } from '@/types/todo';
import { TodoForm } from './TodoForm';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function TodoItem({ todo, onUpdate, onDelete, isLoading = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add null check before parsing
  const dueDate = todo.dueDate ? parseISO(todo.dueDate) : new Date();
  const isOverdue = isPast(dueDate) && !todo.completed;
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);

  const formatDueDate = () => {
    if (!todo.dueDate) return 'No due date';
    if (isDueToday) return 'Due Today';
    if (isDueTomorrow) return 'Due Tomorrow';
    if (isOverdue) return `Overdue - ${format(dueDate, 'MMM dd, yyyy')}`;
    return `Due ${format(dueDate, 'MMM dd, yyyy')}`;
  };

  const getDueDateColor = () => {
    if (todo.completed) return 'bg-green-100 text-green-800 border-green-200';
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    if (isDueToday) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (isDueTomorrow) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(todo._id, { completed: !todo.completed });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = async (formData: any) => {
    setIsUpdating(true);
    try {
      await onUpdate(todo._id, formData);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setIsDeleting(true);
      try {
        await onDelete(todo._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isEditing) {
    return (
      <Card className="shadow-md border-0 bg-white transition-all duration-200">
        <CardContent className="p-6">
          <TodoForm
            onSubmit={handleEdit}
            isLoading={isUpdating}
            initialData={{
              title: todo.title,
              description: todo.description,
              dueDate: todo.dueDate,
            }}
            isEditing={true}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-md border-0 bg-white transition-all duration-200 hover:shadow-lg ${
      isOverdue && !todo.completed ? 'ring-2 ring-red-200' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="mt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={handleToggleComplete}
              disabled={isUpdating || isLoading}
              className="w-5 h-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg leading-tight transition-all duration-200 ${
                  todo.completed 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-900'
                }`}>
                  {todo.title}
                </h3>
                
                {todo.description && (
                  <p className={`mt-2 text-sm leading-relaxed ${
                    todo.completed 
                      ? 'text-gray-400 line-through' 
                      : 'text-gray-600'
                  }`}>
                    {todo.description}
                  </p>
                )}

                {/* Due Date Badge */}
                <div className="flex items-center gap-2 mt-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium px-2 py-1 ${getDueDateColor()}`}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDueDate()}
                  </Badge>
                  
                  {/* Completion Status Badge */}
                  <Badge 
                    variant="outline"
                    className={`text-xs font-medium px-2 py-1 ${
                      todo.completed
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {todo.completed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 mr-1" />
                        In Progress
                      </>
                    )}
                  </Badge>
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Created {todo.createdAt ? format(parseISO(todo.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                  </span>
                  {todo.updatedAt && todo.createdAt && todo.updatedAt !== todo.createdAt && (
                    <span>
                      • Updated {format(parseISO(todo.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading || isUpdating || isDeleting}
                  size="sm"
                  variant="outline"
                  className="p-2 h-8 w-8 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </Button>
                
                <Button
                  onClick={handleDelete}
                  disabled={isLoading || isUpdating || isDeleting}
                  size="sm"
                  variant="outline"
                  className="p-2 h-8 w-8 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors duration-200"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}