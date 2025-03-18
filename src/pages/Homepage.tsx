import React, { useState } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Box, 
    Grid, 
    Paper, 
    CircularProgress, 
    Collapse,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Snackbar,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TDEECalculator from '../ui components/tdeeCalculator';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
//import { v4 as uuidv4 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import { saveWorkout } from '../store/slices/workoutSlice';

type WorkoutSplit = 'fullBody' | 'upperLower' | 'push-pull-legs' | 'bodyPart' | '5day';

const WORKOUT_SPLITS = {
    fullBody: 'Full Body (3 days/week)',
    upperLower: 'Upper/Lower Split (4 days/week)',
    'push-pull-legs': 'Push/Pull/Legs (6 days/week)',
    bodyPart: 'Body Part Split (5 days/week)',
    '5day': 'Custom 5-Day Split'
} as const;

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest?: string;
    notes?: string;
}

interface WorkoutDay {
    day: string;
    exercises: Exercise[];
}

const Homepage: React.FC = (): React.ReactElement => {
    const [start, setStart] = useState(false);
    const [loading, setLoading] = useState(false);
    const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
    const [workoutSplit, setWorkoutSplit] = useState<WorkoutSplit>('fullBody');
    const [saveLoading, setSaveLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const navigate = useNavigate();
    const tdeeData = useSelector((state: RootState) => state.tdee);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    const handleSplitChange = (event: SelectChangeEvent) => {
        setWorkoutSplit(event.target.value as WorkoutSplit);
        setWorkoutPlan(null); // Reset workout plan when split changes
    };

    const handleGenerateWorkoutPlan = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/openai/workout-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tdee: tdeeData.targetCalories,
                    goal: tdeeData.goal,
                    fitnessLevel: 'intermediate',
                    preferences: [],
                    workoutSplit: workoutSplit,
                    splitDetails: {
                        type: workoutSplit,
                        daysPerWeek: {
                            fullBody: 3,
                            upperLower: 4,
                            'push-pull-legs': 6,
                            bodyPart: 5,
                            '5day': 5
                        }[workoutSplit],
                        focusAreas: getWorkoutSplitFocus(workoutSplit)
                    }
                }),
            });

            const data = await response.json();
            console.log('Workout Plan:', data);
            setWorkoutPlan(data.workoutPlan);
        } catch (error) {
            console.error('Error generating workout plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWorkoutSplitFocus = (split: WorkoutSplit) => {
        switch (split) {
            case 'fullBody':
                return ['Full body workout each session'];
            case 'upperLower':
                return ['Upper body', 'Lower body'];
            case 'push-pull-legs':
                return ['Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs'];
            case 'bodyPart':
                return ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
            case '5day':
                return ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
            default:
                return [];
        }
    };

    const parseWorkoutPlan = (planText: string): WorkoutDay[] => {
        const days: WorkoutDay[] = [];
        let currentDay: WorkoutDay | null = null;
        
        // Split the text into lines and process each line
        const lines = planText.split('\n');
        
        for (const line of lines) {
            // Clean the line
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            // Check if this is a day header
            if (cleanLine.toLowerCase().includes('day') && !cleanLine.toLowerCase().includes('rest between')) {
                if (currentDay) {
                    days.push(currentDay);
                }
                currentDay = {
                    day: cleanLine,
                    exercises: []
                };
                continue;
            }

            // If we have a current day and the line contains exercise information
            if (currentDay && 
                (cleanLine.includes('sets') || 
                 cleanLine.includes('reps') || 
                 cleanLine.includes('×') || 
                 cleanLine.includes('x'))) {
                
                // Try to parse exercise information
                const exercise: Exercise = { name: '', sets: 0, reps: '' };
                
                // Extract exercise name (usually comes before the sets/reps)
                const nameParts = cleanLine.split(/[:\-–]/);
                if (nameParts.length > 0) {
                    exercise.name = nameParts[0].trim();
                }

                // Extract sets and reps
                const setsMatch = cleanLine.match(/(\d+)\s*(?:sets|×|x)/i);
                const repsMatch = cleanLine.match(/(\d+(?:-\d+)?)\s*reps/i);
                
                if (setsMatch) {
                    exercise.sets = parseInt(setsMatch[1]);
                }
                if (repsMatch) {
                    exercise.reps = repsMatch[1];
                }

                // Extract rest time if present
                const restMatch = cleanLine.match(/rest\s*:?\s*([\d-]+\s*(?:seconds|mins|minutes))/i);
                if (restMatch) {
                    exercise.rest = restMatch[1];
                }

                // Only add if we have at least a name and either sets or reps
                if (exercise.name && (exercise.sets > 0 || exercise.reps)) {
                    currentDay.exercises.push(exercise);
                }
            }
        }

        // Don't forget to add the last day
        if (currentDay && currentDay.exercises.length > 0) {
            days.push(currentDay);
        }

        return days;
    };

    const handleSaveWorkout = async () => {
        if (!workoutPlan || !user || !tdeeData.targetCalories) return;
        
        setSaveLoading(true);
        try {
            const parsedExercises = parseWorkoutPlan(workoutPlan);
            
            const workout = {
                id: uuidv4(),
                userId: user.uid,
                workoutPlan,
                metadata: {
                    tdee: tdeeData.targetCalories,
                    goal: tdeeData.goal,
                    fitnessLevel: 'intermediate',
                    splitDetails: {
                        type: workoutSplit,
                        daysPerWeek: {
                            fullBody: 3,
                            upperLower: 4,
                            'push-pull-legs': 6,
                            bodyPart: 5,
                            '5day': 5
                        }[workoutSplit],
                        focusAreas: getWorkoutSplitFocus(workoutSplit)
                    }
                },
                exercises: parsedExercises
            };

            await dispatch(saveWorkout(workout) as any);

            setSnackbar({
                open: true,
                message: 'Workout plan saved successfully!',
                severity: 'success'
            });

            // Navigate to dashboard after successful save
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error('Error saving workout:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save workout plan',
                severity: 'error'
            });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    my: 4,
                    flexDirection: 'column',
                    alignItems: 'center',
                    display: start ? 'none' : 'flex'
                }}
            >
                <Typography variant="h4">Welcome to the Gym App</Typography>
                <Button variant="contained" color="primary" onClick={() => setStart(true)}>
                    Get Started
                </Button>
            </Box>
            {start && (
                <Box>
                    <TDEECalculator />
                </Box>
            )}
            {tdeeData.targetCalories && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" color="primary">
                                Your Daily Target: {Math.round(tdeeData.targetCalories)} calories
                            </Typography>
                            <Typography variant="h3" color="primary" gutterBottom>
                                {Math.round(tdeeData.targetCalories)} calories/day
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Based on your TDEE calculation and fitness goals
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Workout Split</InputLabel>
                                <Select
                                    value={workoutSplit}
                                    label="Workout Split"
                                    onChange={handleSplitChange}
                                >
                                    {Object.entries(WORKOUT_SPLITS).map(([value, label]) => (
                                        <MenuItem key={value} value={value}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button 
                                variant="contained" 
                                color="secondary"
                                onClick={handleGenerateWorkoutPlan}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Workout Plan'}
                            </Button>
                        </Box>
                    </Box>

                    {/* Workout Split Info */}
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Selected Split: {WORKOUT_SPLITS[workoutSplit]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Focus Areas: {getWorkoutSplitFocus(workoutSplit).join(' • ')}
                        </Typography>
                    </Paper>

                    {/* Workout Plan Display */}
                    <Collapse in={!!workoutPlan}>
                        <Paper sx={{ p: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Your Personalized {WORKOUT_SPLITS[workoutSplit]} Workout Plan
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleSaveWorkout}
                                    disabled={saveLoading || !user}
                                    startIcon={saveLoading && <CircularProgress size={20} color="inherit" />}
                                >
                                    {saveLoading ? 'Saving...' : 'Save to Dashboard'}
                                </Button>
                            </Box>
                            <Typography 
                                variant="body1" 
                                component="pre" 
                                sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    mt: 2 
                                }}
                            >
                                {workoutPlan}
                            </Typography>
                        </Paper>
                    </Collapse>
                </Box>
            )}

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Homepage;