import React, { useEffect, useState } from 'react';
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
interface ResultData {
    fileName: string;
    suggestions: string;
    message: string;
    data: any; // Adjust the type of 'data' based on its actual structure
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
    const [result, setResult] = useState<ResultData>();

    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    // const handleUpload = async () => {
    //     if (!file) return alert("Please select a file");

    //     const formData = new FormData();
    //     formData.append("file", file);

    //     try {
    //         const response = await fetch("http://localhost:3001/api/upload", {
    //             method: "POST",
    //             body: formData,
    //         });
            
    //         const data = await response.json();
    //         if (response.ok) {
    //             setFileName(data.fileName);
    //             alert("✅ File uploaded successfully!");
    //         } else {
    //             alert("❌ Upload failed: " + data.error);
    //         }
    //     } catch (error) {
    //         console.error("Upload error:", error);
    //     }
    // };

    const UploadToDynamoDB = async () => {
        if (!file) return alert("Please select a file");
    
        setLoading(true); // Start loading
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            const response = await fetch('http://localhost:3001/api/getSuggestion', {
                method: 'POST',
                body: formData
            });
    
            const data = await response.json();
            if (response.ok) {
                setResult(data);
                setSnackbar({ open: true, message: 'Successfully retrieved suggestions!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Error retrieving suggestions', severity: 'error' });
            }
        } catch (error) {
            console.error('Error:', error);
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        } finally {
            setLoading(false); // End loading
        }
        
    };
    useEffect(()=>{
        console.log(JSON.stringify(result?.data.suggestions));
    },[result])
    

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
                {/* <Typography variant="h4">Welcome to the Gym App</Typography>
                <Button variant="contained" color="primary" onClick={() => setStart(true)}>
                    Get Started
                </Button> */}
                <Typography variant='h4'>
                    Upload your CV to start
                </Typography>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx" style={{ display: "none" }} id="file-input" />
                <label htmlFor="file-input">
                    <Button variant="contained" component="span">Choose File</Button>
                </label>

                {file && <Typography variant="body1">📄 Selected: {file.name}</Typography>}

                {/* <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file || loading}>
                    {loading ? <CircularProgress size={24} /> : "Upload"}
                </Button> */}
               <Button variant='contained' onClick={UploadToDynamoDB} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Get Suggestion"} 
                </Button>
                
                {result&&<Box sx={{width:'100%'}}>
                <Typography variant="body1">Message: {JSON.stringify(result.data.suggestions)}</Typography>
                </Box>}
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Homepage;