import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addWorkout, deleteWorkout, updateWorkout } from '../store/slices/gymSlice';

interface WorkoutFormData {
  id: string;
  date: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

const Workouts: React.FC = () => {
  const dispatch = useDispatch();
  const workouts = useSelector((state: RootState) => state.gym.workouts);
  const [open, setOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState<WorkoutFormData | null>(null);
  const [formData, setFormData] = useState<WorkoutFormData>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    exercises: [],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditWorkout(null);
    setFormData({
      id: '',
      date: new Date().toISOString().split('T')[0],
      exercises: [],
    });
  };

  const handleAddExercise = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          sets: 0,
          reps: 0,
          weight: 0,
        },
      ],
    });
  };

  const handleExerciseChange = (index: number, field: string, value: string | number) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value,
    };
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSubmit = () => {
    if (editWorkout) {
      dispatch(updateWorkout(formData));
    } else {
      dispatch(addWorkout({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      }));
    }
    handleClose();
  };

  const handleEdit = (workout: WorkoutFormData) => {
    setEditWorkout(workout);
    setFormData(workout);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteWorkout(id));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Workouts
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
          >
            New Workout
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Exercises</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell>{workout.date}</TableCell>
                  <TableCell>
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id}>
                        {exercise.name} - {exercise.sets}x{exercise.reps} @ {exercise.weight}kg
                      </div>
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(workout)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(workout.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editWorkout ? 'Edit Workout' : 'New Workout'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />

              {formData.exercises.map((exercise, index) => (
                <Box key={exercise.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Exercise {index + 1}</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Name"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    />
                    <TextField
                      label="Sets"
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                    />
                    <TextField
                      label="Reps"
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                    />
                    <TextField
                      label="Weight (kg)"
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))}
                    />
                  </Box>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddExercise}
                sx={{ mt: 2 }}
              >
                Add Exercise
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editWorkout ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Workouts; 