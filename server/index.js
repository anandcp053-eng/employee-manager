import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'employees.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Helper to read/write employees
function readEmployees() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeEmployees(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /employees
app.get('/employees', (req, res) => {
  const employees = readEmployees();
  res.json(employees);
});

// POST /employees
app.post('/employees', upload.single('photo'), (req, res) => {
  const { id, name, mobile, address } = req.body;
  if (!id || !name || !mobile || !address) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const employees = readEmployees();
  if (employees.find(emp => emp.id === id)) {
    return res.status(400).json({ error: 'Employee ID already exists.' });
  }
  const photo = req.file ? `/uploads/${req.file.filename}` : '';
  const newEmp = { id, name, mobile, address, photo };
  employees.push(newEmp);
  writeEmployees(employees);
  res.status(201).json(newEmp);
});

// PUT /employees/:id - update employee
app.put('/employees/:id', upload.single('photo'), (req, res) => {
  const empId = req.params.id;
  const { name, mobile, address } = req.body;
  const employees = readEmployees();
  const idx = employees.findIndex(e => e.id === empId);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found.' });

  if (!name || !mobile || !address) {
    return res.status(400).json({ error: 'Name, mobile and address are required.' });
  }

  // if new photo uploaded, set new path
  if (req.file) {
    // remove old photo file if present
    try {
      const oldPhoto = employees[idx].photo;
      if (oldPhoto) {
        const oldPath = path.join(__dirname, oldPhoto.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    } catch (e) {
      // ignore
    }
    employees[idx].photo = `/uploads/${req.file.filename}`;
  }

  employees[idx].name = name;
  employees[idx].mobile = mobile;
  employees[idx].address = address;

  writeEmployees(employees);
  res.json(employees[idx]);
});

// DELETE /employees/:id - delete employee
app.delete('/employees/:id', (req, res) => {
  const empId = req.params.id;
  const employees = readEmployees();
  const idx = employees.findIndex(e => e.id === empId);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found.' });

  // remove photo file if exists
  try {
    const photo = employees[idx].photo;
    if (photo) {
      const p = path.join(__dirname, photo.replace(/^\//, ''));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  } catch (e) {
    // ignore errors
  }

  const removed = employees.splice(idx, 1)[0];
  writeEmployees(employees);
  res.json({ success: true, removed });
});

// GET /employees/:id
app.get('/employees/:id', (req, res) => {
  const employees = readEmployees();
  const emp = employees.find(e => e.id === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found.' });
  res.json(emp);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
