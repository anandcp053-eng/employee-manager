# Employee Management System Backend

Express.js server for managing employees.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. API runs at `http://localhost:5000`

## API Endpoints
- `GET /employees` - List all employees
- `POST /employees` - Add new employee (fields: id, name, mobile, address, photo)
- `GET /employees/:id` - Get employee details

## Data Storage
- Employees: `data/employees.json`
- Photos: `uploads/`

## Deployment
- Deploy to Render, Vercel, or Glitch for free hosting.
- Ensure `uploads/` and `data/` folders exist and are writable.

## Notes
- No database required; data is stored in JSON file.
- Minimal dependencies for easy setup.
