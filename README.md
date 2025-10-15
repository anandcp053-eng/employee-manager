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

## Quick Start (Windows PowerShell)

Follow these steps in PowerShell to install required tools, clone the repository, and start the app. Run each command on its own line.

1) Install Node.js / npm

- Download and install Node.js (this includes npm) from the official installer: https://nodejs.org/en/download/
- After installation, verify versions:

```powershell
node --version
npm --version
```

2) Install Git

- Download and install Git for Windows: https://git-scm.com/download/win
- After installation, verify:

```powershell
git --version
```

3) Clone the repository

Replace <your-repo-url> with the repository URL (for example, https://github.com/username/employee-manager.git).

```powershell
git clone <your-repo-url>
```

4) Move to project folder

```powershell
cd employee-manager
```

5) Install dependencies and start

Install both server and client dependencies and then start the app. You can run these in separate terminals or use the root helper scripts if present.

Install server:

```powershell
cd server
npm install
cd ..
```

Install client:

```powershell
cd client
npm install
cd ..
```

Start the app (start server and client):

Option A — start server only:

```powershell
cd server
node index.js
```

Option B — start client only:

```powershell
cd client
npm start
```

Option C — if the repository root has a helper script to run both (example: `npm run dev`), run from the root:

```powershell
npm run dev
```

Notes
- If ports 3000 or 5000 are already in use, stop other processes or change the ports.
- Uploaded photos are stored in `server/uploads/` and will not be pushed to remote if `.gitignore` excludes them.


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
