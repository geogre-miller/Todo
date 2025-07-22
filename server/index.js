const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'todo-ashy-chi.vercel.app', 
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// MongoDB connection with database name
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quanghuy00433:jvpzo29TcVy55bQP@todolist.t3rzjd3.mongodb.net/todos_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'todos_db' 

})
.then(() => {
  console.log('✓ Connected to MongoDB');
  console.log(`Database: ${mongoose.connection.name}`);
})
.catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint (test this first)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Try to load routes with error handling
try {
  console.log('Loading todos routes...');
  const todosRouter = require('./routes/todos');
  app.use('/api/todos', todosRouter);
  console.log('✓ Todos routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading todos routes:', error.message);
  console.error('Stack trace:', error.stack);
}

// Handle 404
app.use('/{*any}', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Todos API: http://localhost:${PORT}/api/todos`);
});