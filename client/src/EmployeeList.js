import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AddIcon from '@mui/icons-material/Add';
import AddEmployee from './AddEmployee';

function EmployeeList() {
  // simple helper to wrap matching substring with <mark>
  const highlight = (text, q) => {
    if (!q) return escapeHtml(text);
    const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    return escapeHtml(text).replace(re, '<mark>$1</mark>');
  };

  const escapeHtml = (unsafe) => {
    return unsafe.replace(/[&<>"']/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]; });
  };

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const searchRef = useRef();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/employees');
      const data = await res.json();
      setEmployees(data || []);
    } catch (e) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // debounce search input for performance and AI-like UX
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const s = debounced;
    let list = employees.filter(emp =>
      emp.name.toLowerCase().includes(s) || emp.mobile.includes(s)
    );
    list.sort((a,b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    return list;
  }, [employees, debounced, sortAsc]);

  // suggestions emulate a lightweight AI-suggestion: top matches by startsWith then includes
  const suggestions = useMemo(() => {
    if (!debounced) return [];
    const s = debounced;
    const starts = employees.filter(e => e.name.toLowerCase().startsWith(s) || e.mobile.startsWith(s));
    const includes = employees.filter(e => (e.name.toLowerCase().includes(s) || e.mobile.includes(s)) && !starts.includes(e));
    return [...starts, ...includes].slice(0,5);
  }, [employees, debounced]);

  const openModal = async (id) => {
    setSelected(null);
    setModalOpen(true);
    try {
      const res = await fetch(`/employees/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
      } else {
        setSelected({ error: 'Employee not found' });
      }
    } catch (e) {
      setSelected({ error: 'Network error' });
    }
  };

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', mobile: '', address: '', photo: null });
  const [deleting, setDeleting] = useState(null); // id being deleted
  const [editPreview, setEditPreview] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const openEdit = (emp) => {
    setEditForm({ id: emp.id, name: emp.name, mobile: emp.mobile, address: emp.address, photo: null });
    setEditPreview(emp.photo || null);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    // basic validation
    if (!editForm.name.trim()) { setSnack({ open: true, message: 'Name is required', severity: 'error' }); return; }
    const digits = editForm.mobile.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) { setSnack({ open: true, message: 'Invalid phone', severity: 'error' }); return; }
    const data = new FormData();
    data.append('name', editForm.name);
    data.append('mobile', editForm.mobile);
    data.append('address', editForm.address);
    if (editForm.photo) data.append('photo', editForm.photo);
    try {
      const res = await fetch(`/employees/${editForm.id}`, { method: 'PUT', body: data });
      if (res.ok) {
        setEditOpen(false);
        setSnack({ open: true, message: 'Employee updated', severity: 'success' });
        fetchEmployees();
      } else {
        // handle error
        const err = await res.json();
        setSnack({ open: true, message: err.error || 'Error updating', severity: 'error' });
      }
    } catch (e) {
      setSnack({ open: true, message: 'Network error', severity: 'error' });
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const doDelete = () => {
    const id = deleteConfirm.id;
    setDeleting(id);
    setDeleteConfirm({ open: false, id: null });
    fetch(`/employees/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setDeleting(null);
        setSnack({ open: true, message: 'Deleted', severity: 'success' });
        fetchEmployees();
      })
      .catch(() => { setDeleting(null); setSnack({ open: true, message: 'Delete failed', severity: 'error' }); });
  };

  return (
    <div>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Employee List</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search"
              variant="outlined"
              value={search}
              onChange={e => setSearch(e.target.value)}
              inputRef={searchRef}
              sx={{ width: { xs: 160, sm: 300 } }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={() => setSearch('')} aria-label="clear-search">✕</IconButton>
                )
              }}
            />
            <IconButton onClick={() => setSortAsc(s => !s)} title="Toggle sort">
              <SortByAlphaIcon />
            </IconButton>
            <Button onClick={() => { setSearch(''); fetchEmployees(); }}>Refresh</Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}>Add Employee</Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No employees found. Try adding one.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(emp => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{emp.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={emp.photo} alt={emp.name} />
                        <Button variant="text" onClick={() => openModal(emp.id)}>
                          {/* highlight match */}
                          {debounced ? (
                            <span dangerouslySetInnerHTML={{__html: highlight(emp.name, debounced)}} />
                          ) : emp.name}
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>{debounced ? (<span dangerouslySetInnerHTML={{__html: highlight(emp.mobile, debounced)}} />) : emp.mobile}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => openEdit(emp)} title="Edit"><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => confirmDelete(emp.id)} title="Delete">
                          {deleting === emp.id ? <CircularProgress size={18} /> : <DeleteIcon />}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Employee Details
            <IconButton
              aria-label="close"
              onClick={() => setModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {!selected ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : selected.error ? (
              <Typography color="error">{selected.error}</Typography>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {selected.photo ? (
                      <Avatar src={selected.photo} alt={selected.name} sx={{ width: 180, height: 180 }} />
                    ) : (
                      <Avatar sx={{ width: 180, height: 180, bgcolor: 'grey.200' }}>
                        <PersonIcon sx={{ fontSize: 64, color: 'grey.600' }} />
                      </Avatar>
                    )}
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6">{selected.name}</Typography>
                    <Typography sx={{ mt: 1 }}><strong>ID:</strong> {selected.id}</Typography>
                    <Typography sx={{ mt: 1 }}><strong>Mobile:</strong> {selected.mobile}</Typography>
                    <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}><strong>Address:</strong> {selected.address}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add Employee dialog (reuses AddEmployee component) */}
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogContent>
            <AddEmployee onAdded={() => { setAddOpen(false); fetchEmployees(); }} />
          </DialogContent>
        </Dialog>

        {/* Edit dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <TextField label="ID" value={editForm.id} disabled />
                  <TextField label="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  <TextField label="Mobile" value={editForm.mobile} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))} />
                  <TextField label="Address" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} multiline rows={2} />
                  <div>
                    <input id="edit-photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { setEditForm(f => ({ ...f, photo: e.target.files[0] })); setEditPreview(URL.createObjectURL(e.target.files[0])); }} />
                    <label htmlFor="edit-photo">
                      <Button variant="outlined" component="span">Replace Photo</Button>
                    </label>
                  </div>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Stack spacing={1} alignItems="center">
                  <Avatar src={editPreview} sx={{ width: 140, height: 140 }} />
                  <Typography variant="body2" color="text.secondary">Preview</Typography>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={submitEdit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete confirmation dialog */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })}>
          <DialogTitle>Confirm delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this employee?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>Cancel</Button>
            <Button color="error" variant="contained" onClick={doDelete}>Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Stack>
    </div>
  );
}

export default EmployeeList;
