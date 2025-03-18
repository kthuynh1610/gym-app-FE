import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TDEEData {
  age: number;
  gender: 'male' | 'female';
  weight: number; // in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  tdee?: number;
  bmr?: number;
  targetCalories?: number;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  active: 1.725, // Heavy exercise 6-7 days/week
  very_active: 1.9, // Very heavy exercise, physical job
};

const GOAL_ADJUSTMENTS = {
  lose: -500, // Caloric deficit for weight loss
  maintain: 0, // Maintain current weight
  gain: 500, // Caloric surplus for weight gain
};

const initialState: TDEEData = {
  age: 0,
  gender: 'male',
  weight: 0,
  height: 0,
  activityLevel: 'moderate',
  goal: 'maintain',
};

const tdeeSlice = createSlice({
  name: 'tdee',
  initialState,
  reducers: {
    setTDEEData: (state, action: PayloadAction<Partial<TDEEData>>) => {
      return { ...state, ...action.payload };
    },
    calculateTDEE: (state) => {
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (state.gender === 'male') {
        bmr = 10 * state.weight + 6.25 * state.height - 5 * state.age + 5;
      } else {
        bmr = 10 * state.weight + 6.25 * state.height - 5 * state.age - 161;
      }

      // Calculate TDEE
      const tdee = bmr * ACTIVITY_MULTIPLIERS[state.activityLevel];

      // Calculate target calories based on goal
      const targetCalories = tdee + GOAL_ADJUSTMENTS[state.goal];

      return {
        ...state,
        bmr,
        tdee,
        targetCalories,
      };
    },
    resetTDEE: () => initialState,
  },
});

export const { setTDEEData, calculateTDEE, resetTDEE } = tdeeSlice.actions;
export default tdeeSlice.reducer; 