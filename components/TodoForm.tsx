'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { TodoFormData } from '@/types/todo';

interface TodoFormProps {
  onSubmit: (todo: TodoFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<TodoFormData>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function TodoForm({ 
  onSubmit, 
  isLoading = false, 
  initialData = {}, 
  isEditing = false,
  onCancel 
}: TodoFormProps) {
  const [formData, setFormData] = useState<TodoFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
  });
  const [errors, setErrors] = useState<Partial<TodoFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<TodoFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      
      if (!isEditing) {
        // Reset form only when creating new todo
        setFormData({ title: '', description: '', dueDate: '' });
      }
      setErrors({});
    } catch (error) {
      console.error('Error submitting todo:', error);
    }
  };

  const handleInputChange = (field: keyof TodoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Plus className="w-5 h-5 text-blue-600" />
          {isEditing ? 'Edit Todo' : 'Create New Todo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter todo title..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`transition-colors duration-200 ${
                errors.title 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter todo description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`min-h-24 transition-colors duration-200 ${
                errors.description 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              maxLength={1000}
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={`transition-colors duration-200 ${
                errors.dueDate 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.dueDate}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Todo' : 'Create Todo'
              )}
            </Button>
            
            {isEditing && onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}