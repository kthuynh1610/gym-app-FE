import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { TDEEData, setTDEEData, calculateTDEE } from '../store/slices/tdeeSlice';

const TDEECalculator: React.FC = () => {
  const dispatch = useDispatch();
  const tdeeData = useSelector((state: RootState) => state.tdee);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof TDEEData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' 
      ? parseFloat(event.target.value) 
      : event.target.value;
    dispatch(setTDEEData({ [field]: value }));
  };

  const handleSelectChange = (field: keyof TDEEData) => (
    event: SelectChangeEvent
  ) => {
    dispatch(setTDEEData({ [field]: event.target.value }));
  };

  const handleCalculate = () => {
    if (tdeeData.weight && tdeeData.height && tdeeData.age) {
      setLoading(true);
      // Simulate calculation delay
      setTimeout(() => {
        dispatch(calculateTDEE());
        setLoading(false);
        setShowResults(true);
      }, 1000);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          TDEE Calculator
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
          Calculate your Total Daily Energy Expenditure and get personalized calorie targets
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Age"
                  type="number"
                  value={tdeeData.age || ''}
                  onChange={handleInputChange('age')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 120 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={tdeeData.gender}
                    label="Gender"
                    onChange={handleSelectChange('gender')}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={tdeeData.weight || ''}
                  onChange={handleInputChange('weight')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
                <TextField
                  label="Height (cm)"
                  type="number"
                  value={tdeeData.height || ''}
                  onChange={handleInputChange('height')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Activity Level</InputLabel>
                  <Select
                    value={tdeeData.activityLevel}
                    label="Activity Level"
                    onChange={handleSelectChange('activityLevel')}
                  >
                    <MenuItem value="sedentary">Sedentary (little or no exercise)</MenuItem>
                    <MenuItem value="light">Light (exercise 1-3 days/week)</MenuItem>
                    <MenuItem value="moderate">Moderate (exercise 3-5 days/week)</MenuItem>
                    <MenuItem value="active">Active (exercise 6-7 days/week)</MenuItem>
                    <MenuItem value="very_active">Very Active (hard exercise & physical job)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Goal</InputLabel>
                  <Select
                    value={tdeeData.goal}
                    label="Goal"
                    onChange={handleSelectChange('goal')}
                  >
                    <MenuItem value="lose">Lose Weight</MenuItem>
                    <MenuItem value="maintain">Maintain Weight</MenuItem>
                    <MenuItem value="gain">Gain Weight</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCalculate}
                  disabled={loading || !tdeeData.weight || !tdeeData.height || !tdeeData.age}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate TDEE'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Results
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <CircularProgress />
                </Box>
              ) : showResults && tdeeData.bmr && tdeeData.tdee && tdeeData.targetCalories ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Basal Metabolic Rate (BMR)
                    </Typography>
                    <Typography variant="h4">
                      {Math.round(tdeeData.bmr)} calories/day
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Calories your body burns at complete rest
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Daily Energy Expenditure (TDEE)
                    </Typography>
                    <Typography variant="h4">
                      {Math.round(tdeeData.tdee)} calories/day
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total calories burned including activity
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recommended Daily Calories
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {Math.round(tdeeData.targetCalories)} calories/day
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Adjusted calories based on your goal
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Fill in your information and click Calculate to see your results
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TDEECalculator; 