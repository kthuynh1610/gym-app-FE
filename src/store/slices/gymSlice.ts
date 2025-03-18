import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
}

interface GymState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GymState = {
  workouts: [],
  currentWorkout: null,
  isLoading: false,
  error: null,
};

const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    setWorkouts: (state, action: PayloadAction<Workout[]>) => {
      state.workouts = action.payload;
      state.error = null;
    },
    setCurrentWorkout: (state, action: PayloadAction<Workout>) => {
      state.currentWorkout = action.payload;
    },
    addWorkout: (state, action: PayloadAction<Workout>) => {
      state.workouts.push(action.payload);
    },
    updateWorkout: (state, action: PayloadAction<Workout>) => {
      const index = state.workouts.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workouts[index] = action.payload;
      }
    },
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(w => w.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setWorkouts,
  setCurrentWorkout,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  setLoading,
  setError,
  clearError,
} = gymSlice.actions;

export default gymSlice.reducer; 