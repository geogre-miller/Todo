# Todo Manager

A full-stack Todo application built with Next.js, Express.js, and MongoDB.

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/todo-manager.git
cd todo-manager
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory with the following content:
```bash
# MongoDB Atlas:
# MONGODB_URI=mongodb+srv://quanghuy00433:jvpzo29TcVy55bQP@todolist.t3rzjd3.mongodb.net/todos_db

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. MongoDB Setup
#### MongoDB Atlas (Cloud)
- Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a new cluster
- Get the connection string and update `MONGODB_URI` in `.env.local`

### 5. Database Initialization
The application will automatically create the database and collections on first run.

## 🏃‍♂️ Running the Application

### Development Mode
#### Option 1: Run Both Frontend and Backend
```bash
npm run dev:full
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend
npm run dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure
```
todo-manager/
├── app/                    # Next.js app directory
│   ├── api/               # Next.js API routes (if used)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── TodoForm.tsx      # Todo creation form
│   ├── TodoList.tsx      # Todo list display
│   └── TodoFilters.tsx   # Filter components
├── lib/                  # Utility libraries
│   └── api.ts           # API client configuration
├── server/              # Express.js backend
│   ├── controllers/     # Route controllers
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── server.js       # Server entry point
├── types/              # TypeScript type definitions
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## 🛠️ Scripts
### Development
```bash
npm run dev              # Start Next.js dev server
npm run server          # Start Express.js server
npm run dev:full        # Start both frontend and backend
```

### Production
```bash
npm run build           # Build Next.js application
npm start              # Start production server
```

### Utilities
```bash
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
```

## 🌐 API Endpoints
### Todos
- `GET /api/todos` - Get todos with pagination and filters
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Health Check
- `GET /api/health` - Server health status

### Query Parameters for `GET /api/todos`
- `search` - Search in title and description
- `status` - Filter by status (all, pending, completed)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: 'dueDate')

## 🐛 Troubleshooting
### Common Issues
#### Server Connection Failed
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env.local`
- Ensure backend server is running on port 5000

#### CORS Errors
- Backend includes CORS middleware for `localhost:3000`
- Update CORS configuration in `server/server.js` for production

#### Build Errors
- Run `npm run type-check` to identify TypeScript issues
- Ensure all dependencies are installed

## Happy coding! 🚀
