# Employee Management System

A simple, beginner-friendly full-stack web application for managing employees. Built with React (frontend) and Express.js (backend).

## Features
- Add, view, and search employees
- Photo upload and local storage
- Responsive design
- Real-time search filtering
- Form validation

## Folder Structure
- `client/` - React frontend
- `server/` - Express backend

## Setup Instructions

### Backend (server/)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. The API will run on `http://localhost:5000` by default.

### Frontend (client/)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the React app:
   ```bash
   npm start
   ```
3. The app will run on `http://localhost:3000` by default.

### Deployment
- **Frontend:** Deploy to GitHub Pages (see client/README.md for details)
- **Backend:** Deploy to Render, Vercel, or Glitch (see server/README.md for details)

## API Endpoints
- `GET /employees` - List all employees
- `POST /employees` - Add new employee
- `GET /employees/:id` - Get employee details

## Data Storage
- Employee data is stored in `server/data/employees.json`
- Uploaded photos are stored in `server/uploads/`

## License
MIT
