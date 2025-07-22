const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /api/todos - Get all todos with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'dueDate'
    } = req.query;

    // Build query
    const query = {};

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'active') {
      query.completed = false;
    }

    // Set up sort options
    let sortOptions = {};
    if (sortBy === 'dueDate') {
      sortOptions = {
        completed: 1, // Incomplete tasks first
        dueDate: 1    // Earliest due date first
      };
    } else if (sortBy === 'createdAt') {
      sortOptions = { createdAt: -1 }; // Newest first
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 }; // Alphabetical
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * pageSize;

    // Execute query with pagination
    const todos = await Todo.find(query)
      .sort(sortOptions)
      .limit(pageSize)
      .skip(skip);

    // Get total count for pagination
    const totalTodos = await Todo.countDocuments(query);
    const totalPages = Math.ceil(totalTodos / pageSize);

    res.json({
      todos,
      pagination: {
        totalTodos,
        currentPage: pageNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch todos',
      message: error.message 
    });
  }
});

// POST /api/todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }

    // Parse and validate due date
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid due date format' });
    }

    // Create new todo
    const todo = new Todo({
      title: title.trim(),
      description: description?.trim() || '',
      dueDate: parsedDate
    });

    const savedTodo = await todo.save();
    
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ 
      error: 'Failed to create todo',
      message: error.message 
    });
  }
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate } = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    // Check if todo exists
    const existingTodo = await Todo.findById(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Prepare update data
    const updateData = {};
    
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updateData.title = title.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || '';
    }
    
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }
    
    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
      updateData.dueDate = parsedDate;
    }

    // Update the todo
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ 
      error: 'Failed to update todo',
      message: error.message 
    });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const deletedTodo = await Todo.findByIdAndDelete(id);
    
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ 
      message: 'Todo deleted successfully',
      todo: deletedTodo 
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ 
      error: 'Failed to delete todo',
      message: error.message 
    });
  }
});

// GET /api/todos/:id - Get a specific todo
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    const todo = await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ 
      error: 'Failed to fetch todo',
      message: error.message 
    });
  }
});

module.exports = router;