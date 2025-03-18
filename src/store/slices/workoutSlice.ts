import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface WorkoutSplitDetails {
  type: string;
  daysPerWeek: number;
  focusAreas: string[];
}

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

export interface Workout {
  id: string;
  userId: string;
  workoutPlan: string;
  metadata: {
    tdee: number;
    goal: string;
    fitnessLevel: string;
    splitDetails: WorkoutSplitDetails;
  };
  exercises: WorkoutDay[];
  createdAt: string;
}

interface WorkoutState {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutState = {
  workouts: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async (userId: string) => {
    const response = await fetch(`http://localhost:3001/api/workouts?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch workouts');
    return response.json();
  }
);

export const saveWorkout = createAsyncThunk(
  'workouts/saveWorkout',
  async (workout: Omit<Workout, 'createdAt'>) => {
    const response = await fetch('http://localhost:3001/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workout),
    });
    if (!response.ok) throw new Error('Failed to save workout');
    return response.json();
  }
);

export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (id: string) => {
    const response = await fetch(`http://localhost:3001/api/workouts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete workout');
    return id;
  }
);

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch workouts
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action: PayloadAction<Workout[]>) => {
        state.workouts = action.payload;
        state.loading = false;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workouts';
      })
      // Save workout
      .addCase(saveWorkout.fulfilled, (state, action: PayloadAction<Workout>) => {
        state.workouts.push(action.payload);
      })
      // Delete workout
      .addCase(deleteWorkout.fulfilled, (state, action: PayloadAction<string>) => {
        state.workouts = state.workouts.filter(workout => workout.id !== action.payload);
      });
  },
});

export default workoutSlice.reducer; 