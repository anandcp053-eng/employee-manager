import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Box
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function EmployeeDetail() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/employees/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setEmp(data))
      .catch(() => setError('Employee not found'));
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!emp) return <div>Loading...</div>;

  return (
    <Card sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {emp.photo ? (
            <Avatar src={emp.photo} alt={emp.name} sx={{ width: 220, height: 220 }} />
          ) : (
            <Avatar sx={{ width: 220, height: 220, bgcolor: 'grey.200' }}>
              <PersonIcon sx={{ fontSize: 96, color: 'grey.600' }} />
            </Avatar>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <CardContent>
            <Typography variant="h4">{emp.name}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography><strong>ID:</strong> {emp.id}</Typography>
              <Typography sx={{ mt: 1 }}><strong>Mobile:</strong> {emp.mobile}</Typography>
              <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}><strong>Address:</strong> {emp.address}</Typography>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" component={RouterLink} to="/">Back to List</Button>
            </Box>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
}

export default EmployeeDetail;
