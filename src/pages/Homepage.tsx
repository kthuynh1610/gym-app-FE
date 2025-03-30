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
    LinearProgress,
    Alert
} from '@mui/material';
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import Mammoth from "mammoth";
import ReactMarkdown from "react-markdown"
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import remarkGfm from "remark-gfm";
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
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fullText, setFullText] = useState<string | null>(null);
    const [showFullText, setShowFullText] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [statusText, setStatusText] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);

            if (selectedFile.type === "application/pdf") {
                // PDF Preview (Multi-Page Support)
                const pdfUrl = URL.createObjectURL(selectedFile);
                setFilePreview(pdfUrl);
            } else if (selectedFile.name.endsWith(".docx")) {
                // DOCX Preview (Extract Full Text)
                const reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile);
                reader.onload = async (e) => {
                    if (e.target?.result) {
                        const extractedText = await Mammoth.extractRawText({ arrayBuffer: e.target.result as ArrayBuffer });
                        setFullText(extractedText.value);
                        setFilePreview(extractedText.value.substring(0, 1000) + "..."); // Show first 1000 characters
                    }
                };
            } else {
                setFilePreview(null);
            }
        }
    };

    const UploadToDynamoDB = async () => {
        if (!file) return alert("Please select a file");
        setProgress(25);
        setStatusText('Waiting for CV Analysis...');
        setLoading(true); // Start loading
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            setProgress(50);
            setStatusText('Start analyzing CV...');
            const response = await fetch('http://localhost:3001/api/getSuggestion', {
                method: 'POST',
                body: formData
            });
    
            const data = await response.json();
            setProgress(60);
            setStatusText("🤖 Generating CV Suggestions...");
            if (response.ok) {
                setResult(data);
                setSnackbar({ open: true, message: 'Successfully retrieved suggestions!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Error retrieving suggestions', severity: 'error' });
            }
        } catch (error) {
            setProgress(0);
            setStatusText('Error... please try again');
            console.error('Error:', error);
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        } finally {
            setLoading(false); // End loading
            setProgress(100);
            setStatusText("Finished...");
            setTimeout(() => setLoading(false), 1000);
        }
        
    };
    useEffect(()=>{
        console.log(JSON.stringify(result?.data.suggestions));
    },[result])
    

    return (
        <Container sx={{maxWidth:"1000px"}}>
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
                {filePreview && (
                    <Paper sx={{ mt: 2, p: 2, width: "100%", maxHeight: "800px", overflow: "auto", backgroundColor: "#f5f5f5" }}>
                        {file?.type === "application/pdf" ? (
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
                                <Viewer fileUrl={filePreview} />
                            </Worker>
                        ) : (
                            <>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {showFullText ? fullText : filePreview}
                                </Typography>
                                {fullText && fullText.length > 1000 && (
                                    <Button variant="text" onClick={() => setShowFullText(!showFullText)}>
                                        {showFullText ? "Show Less" : "Show More"}
                                    </Button>
                                )}
                            </>
                        )}
                    </Paper>
                )}    
                {/* <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file || loading}>
                    {loading ? <CircularProgress size={24} /> : "Upload"}
                </Button> */}
                {
                    file ? <Button variant='contained' sx={{mt:1}} onClick={UploadToDynamoDB} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Get Suggestion"} 
                    </Button> : null
                }
               
                {loading && (
                    <Box sx={{ width: "80%", mt: 2 }}>
                        <Typography variant="body2" align="center">{statusText}</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                )}
                
                {result&&<Box sx={{width:'100%'}}>
                <Typography variant="body1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {result?.data.suggestions}
                    </ReactMarkdown>
                </Typography>
                            
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