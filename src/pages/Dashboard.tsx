import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { fetchWorkouts, deleteWorkout } from '../store/slices/workoutSlice';
import type { Workout } from '../store/slices/workoutSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { workouts, loading, error } = useSelector((state: RootState) => state.workouts);

  useEffect(() => {
    if (user) {
      dispatch(fetchWorkouts(user.uid) as any);
    }
  }, [dispatch, user]);

  const handleDeleteWorkout = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      dispatch(deleteWorkout(id) as any);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderExercises = (workout: Workout) => (
    <Box sx={{ mt: 2 }}>
      {workout.exercises.map((day, dayIndex) => (
        <Accordion key={dayIndex}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{day.day}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {day.exercises.map((exercise, exerciseIndex) => (
                <ListItem key={exerciseIndex}>
                  <ListItemText
                    primary={exercise.name}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={`${exercise.sets} sets`} 
                          size="small" 
                          color="primary"
                        />
                        <Chip 
                          label={`${exercise.reps} reps`} 
                          size="small" 
                          color="secondary"
                        />
                        {exercise.rest && (
                          <Chip 
                            label={`Rest: ${exercise.rest}`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.displayName || 'Athlete'}!
        </Typography>
        
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Total Workout Plans
              </Typography>
              <Typography component="p" variant="h4">
                {workouts.length}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Latest Plan
              </Typography>
              <Typography component="p" variant="body1">
                {workouts[0]?.metadata.splitDetails.type || 'No plans yet'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {workouts[0]?.createdAt ? formatDate(workouts[0].createdAt) : ''}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Active Goals
              </Typography>
              <Typography component="p" variant="body1">
                {workouts[0]?.metadata.goal || 'Set your first goal'}
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/')}
                >
                  Create New Workout Plan
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Saved Workout Plans */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              Your Workout Plans
            </Typography>
            <Grid container spacing={3}>
              {workouts.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No workout plans saved yet. Create your first plan!
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                workouts.map((workout: Workout) => (
                  <Grid item xs={12} md={6} key={workout.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom>
                            {workout.metadata.splitDetails.type} Split
                          </Typography>
                          <IconButton 
                            onClick={() => handleDeleteWorkout(workout.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Created on {formatDate(workout.createdAt)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Goal: {workout.metadata.goal}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          TDEE: {Math.round(workout.metadata.tdee)} calories
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Focus Areas: {workout.metadata.splitDetails.focusAreas.join(' • ')}
                        </Typography>
                        {renderExercises(workout)}
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/workouts/${workout.id}`)}>
                          View Full Plan
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 