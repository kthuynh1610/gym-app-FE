import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    CircularProgress,
    Snackbar,
    LinearProgress,
    Alert,
    TextareaAutosize
} from '@mui/material';
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import Mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { v4 as uuidv4 } from 'uuid';
//import {html2pdf} from 'html2pdf.ts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { saveWorkout } from '../store/slices/workoutSlice';
import { setSuggestion,updateSuggestions } from '../store/slices/fileCVSlice';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";


interface ResultData {
    fileName: string;
    suggestions: string;
    message: string;
    data: any;
}

const Homepage: React.FC = (): React.ReactElement => {
    const [start, setStart] = useState(false);
    const [loading, setLoading] = useState(false);
    const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const navigate = useNavigate();
    const tdeeData = useSelector((state: RootState) => state.tdee);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const cvResult = useSelector((state:RootState)=>state.CV);
    const [result, setResult] = useState<ResultData>();
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fullText, setFullText] = useState<string | null>(null);
    const [showFullText, setShowFullText] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [statusText, setStatusText] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        if (selectedFile.type === "application/pdf") {
            setFilePreview(URL.createObjectURL(selectedFile));
        } else if (selectedFile.name.endsWith(".docx")) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(selectedFile);
            reader.onload = async (e) => {
                if (e.target?.result) {
                    const extractedText = await Mammoth.extractRawText({ arrayBuffer: e.target.result as ArrayBuffer });
                    setFullText(extractedText.value);
                    setFilePreview(extractedText.value.substring(0, 1000) + "...");
                }
            };
        } else {
            setFilePreview(null);
        }
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
          setFile(droppedFile);
        }
      };
    
      const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
      };

      const downloadPDF = async () => {
        const input = document.getElementById('cv-suggestion');
        if (!input) return;
    
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
    
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
    
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
        let heightLeft = imgHeight;
        let position = 0;
    
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
    
        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
    
        pdf.save('cv_suggestions.pdf');
    };

    const uploadToDynamoDB = async () => {
        if (!file) return alert("Please select a file");
    
        setLoading(true);
        setProgress(5);
        setStatusText("Uploading CV...");
        
        // Simulate smooth progress
        let fakeProgress = 5;
        const progressInterval = setInterval(() => {
            fakeProgress += Math.random() * 10; // Increment randomly
            if (fakeProgress >= 90) {
                clearInterval(progressInterval);
                setProgress(90);

            }if(fakeProgress>=50 && fakeProgress<95){
                setStatusText("Analyzing your CV...")
            }
             else {
                setProgress(fakeProgress);
            }
        }, 500);
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            const response = await fetch("https://s6b6cgg4ka.execute-api.ap-southeast-2.amazonaws.com/dev", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json',
                  },
                mode: 'cors'
            });
    
            clearInterval(progressInterval);
            setProgress(95);
            setStatusText("Finishing up...");
    
            const data = await response.json();
            if (response.ok) {
                dispatch(setSuggestion(data));
                setSnackbar({ open: true, message: "Successfully retrieved suggestions!", severity: "success" });
                setProgress(100);
            } else {
                setSnackbar({ open: true, message: "Error retrieving suggestions", severity: "error" });
                setProgress(0);
            }
        } catch (error) {
            clearInterval(progressInterval);
            setProgress(0);
            setStatusText("Error... please try again");
            console.error("Error:", error);
            setSnackbar({ open: true, message: "An error occurred", severity: "error" });
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };
    
    return (
        <Container sx={{ maxWidth: "1000px" }}>
            <Box
                sx={{
                    my: 4,
                    flexDirection: 'column',
                    alignItems: 'center',
                    display: start ? 'none' : 'flex'
                }}
            >
                <Typography variant='h4'>Upload your CV to start</Typography>

               
                <label htmlFor="file-upload">
                    <Box
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    
                    sx={{
                        border: "2px dashed #aaa",
                        borderRadius: 2,
                        padding: 4,
                        width:'400px',
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#f9f9f9",
                        transition: "0.5s",
                        "&:hover": {
                        backgroundColor: "#f0f0f0",
                        borderColor: "#333",
                        },
                    }}
                    >
                    <CloudUploadIcon sx={{ fontSize: 60, color: "#888" }} />
                    {
                        file ? <Typography variant="body1">{file.name}</Typography> :  <Typography variant="body1" color="textSecondary">
                        Drag & drop your file here, or click to upload
                    </Typography>
                    }
                    
                    </Box>
                    
                </label>
                <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx"
                        style={{ display: "none" }}
                        id="file-upload"
                    />

                {/* {file && <Typography variant="body1">📄 Selected: {file.name}</Typography>} */}

                {/* {filePreview && (
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
                )} */}

                {file && (
                    <Button
                        variant='contained'
                        sx={{ mt: 1 }}
                        onClick={uploadToDynamoDB}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Get Suggestion"}
                    </Button>
                )}

                {loading && (
                    <Box sx={{ width: "80%", mt: 2 }}>
                        <Typography variant="body2" align="center">{statusText}</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                )}

                {cvResult?.data?.suggestions && !loading && (
                    <Box sx={{ width: '100%', mt: 3 }} >
                        <Typography variant='h5'>
                        Here is your improved version: 
                        </Typography>
                        <Paper id="cv-suggestion" sx={{ width: '100%', mt: 3, p:1 }}>
                            
                            <Typography variant="body1">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {cvResult.data.suggestions}
                                </ReactMarkdown>
                            </Typography>
                        </Paper>
                        <Button variant="outlined" sx={{ mt: 2 }} onClick={downloadPDF}>
                            Download as PDF
                        </Button>
                    </Box>
                )}
                {/* <TextareaAutosize
                    minRows={15}
                    value={cvResult?.data.suggestions}
                    onChange={(e) => dispatch(updateSuggestions(e.target.value))}
                    style={{
                        width: '100%',
                        // fontSize: '1rem',
                        // padding: '1rem',
                        // borderRadius: '8px',
                        // border: '1px solid #ccc',
                        // resize: 'vertical',
                        // fontFamily: 'monospace',
                    }}
                /> */}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Homepage;
