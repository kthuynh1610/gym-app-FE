import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gymReducer from './slices/gymSlice';
import tdeeReducer from './slices/tdeeSlice';
import workoutReducer from './slices/workoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gym: gymReducer,
    tdee: tdeeReducer,
    workouts: workoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 