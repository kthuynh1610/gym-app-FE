# Gym Workout Tracker

A modern web application for tracking your gym workouts, built with React, TypeScript, Material-UI, and Firebase.

## Features

- User authentication (sign up, sign in, sign out)
- Track workouts with exercises, sets, reps, and weights
- Dashboard with workout statistics
- Workout history management
- Modern and responsive UI with Material-UI
- State management with Redux Toolkit

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account and project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd gym-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable Authentication:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Email/Password authentication
   - Copy your Firebase configuration

4. Configure Firebase:
   - Update the Firebase configuration in `src/config/firebase.ts` with your project credentials

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── config/        # Configuration files
  ├── features/      # Feature-specific components
  ├── pages/         # Page components
  ├── services/      # API and service functions
  ├── store/         # Redux store and slices
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Technologies Used

- React
- TypeScript
- Material-UI
- Redux Toolkit
- Firebase Authentication
- React Router

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 