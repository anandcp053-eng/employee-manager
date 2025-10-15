import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Avatar,
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';

function AddEmployee({ onAdded } = {}) {
  const [form, setForm] = useState({ id: '', name: '', mobile: '', address: '', photo: null });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // create preview when photo changes
  useEffect(() => {
    if (form.photo) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
    return undefined;
  }, [form.photo]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  const validate = () => {
    if (!form.id.trim()) return 'ID is required';
    if (!form.name.trim()) return 'Name is required';
    const digits = form.mobile.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number (7-15 digits)';
    if (!form.address.trim()) return 'Address is required';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('id', form.id.trim());
      data.append('name', form.name.trim());
      data.append('mobile', form.mobile.trim());
      data.append('address', form.address.trim());
      if (form.photo) data.append('photo', form.photo);

      const res = await fetch('/employees', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        setSnack({ open: true, message: 'Employee added', severity: 'success' });
        // callback (if used inside modal) or navigate back
        if (onAdded) {
          setTimeout(() => onAdded(), 500);
        } else {
          setTimeout(() => navigate('/'), 700);
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Error adding employee');
        setSnack({ open: true, message: err.error || 'Error adding employee', severity: 'error' });
      }
    } catch (e) {
      setError('Network error');
      setSnack({ open: true, message: 'Network error', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Add Employee</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <TextField label="ID" name="id" value={form.id} onChange={handleChange} fullWidth />
              <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
              <TextField label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} fullWidth helperText="Include country code if available" />
              <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth multiline rows={2} />
              <div>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  name="photo"
                  onChange={handleChange}
                />
                <label htmlFor="photo-upload">
                  <Button variant="outlined" component="span">Upload Photo</Button>
                  <FormHelperText sx={{ display: 'inline', ml: 2 }}>Optional</FormHelperText>
                </label>
              </div>
              {error && <Typography color="error">{error}</Typography>}
              <div>
                <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : null}>
                  {loading ? 'Saving...' : 'Add Employee'}
                </Button>
              </div>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">Preview</Typography>
            <Stack spacing={2} alignItems="center">
              <Avatar src={preview} alt={form.name || 'Preview'} sx={{ width: 160, height: 160 }} />
              <Typography variant="body2" color="text.secondary">Photo preview (optional)</Typography>
            </Stack>
          </Grid>
        </Grid>
      </form>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Paper>
  );
}

export default AddEmployee;
