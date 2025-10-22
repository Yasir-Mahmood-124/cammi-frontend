"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
    Box,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    TextField,
    Button,
    Paper,
    Container,
    CircularProgress,
    Backdrop,
} from "@mui/material";
import { Toaster, toast } from "react-hot-toast";
import { useSendUserFeedbackMutation } from "@/redux/services/feedback/userFeedbackApi";
import { useCheckFeedbackMutation } from "@/redux/services/feedback/checkFeedbackApi"; // ✅ import your checkFeedback mutation

interface FeedbackData {
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    question5: string;
    question6: string;
    question7: string;
    question8: string;
    mostValuable: string;
    confusing: string;
}

const FeedbackPage = () => {
    const [feedback, setFeedback] = useState<FeedbackData>({
        question1: "",
        question2: "",
        question3: "",
        question4: "",
        question5: "",
        question6: "",
        question7: "",
        question8: "",
        mostValuable: "",
        confusing: "",
    });

    const [feedbackStatus, setFeedbackStatus] = useState<"Pending" | "Done" | null>(null);

    const [sendFeedback, { isLoading }] = useSendUserFeedbackMutation();
    const [checkFeedback, { isLoading: statusLoading }] = useCheckFeedbackMutation();

    const questions = [
        { id: "question1", text: "The tool helped me quickly generate clear and actionable marketing strategies." },
        { id: "question2", text: "The Ideal Customer Profile (ICP) suggestions felt relevant and well-aligned with my target audience." },
        { id: "question3", text: "Creating a campaign plan using the tool felt intuitive and saved me time compared to my usual process." },
        { id: "question4", text: "The lead calculator gave me realistic and useful projections for campaign planning." },
        { id: "question5", text: "The content generated (LinkedIn post) aligned well with the campaign tone and marketing goals." },
        { id: "question6", text: "I found it easy to customize or edit the generated content before publishing." },
        { id: "question7", text: "Connecting and scheduling posts to platforms like LinkedIn, email, and blog was seamless." },
        { id: "question8", text: "The user interface made it easy for me to understand where I was and what to do next." },
    ];

useEffect(() => {
    const fetchStatus = async () => {
        const sessionId = Cookies.get("token");
        if (!sessionId) return;

        try {
            const response = await checkFeedback().unwrap(); // call without arguments
            console.log("Full response from API:", response);

            // adjust according to your API response
            // Example if API returns { data: { status: "Pending" } }
            // Map API message to "Pending" | "Done"
            const status = response?.message === "Done" ? "Done" : "Pending";
            setFeedbackStatus(status);
        } catch (err) {
            console.error("Failed to check feedback status:", err);
        }
    };

    fetchStatus();
}, [checkFeedback]);


    const handleRatingChange = (questionId: string, value: string) => {
        setFeedback((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleTextChange = (field: string, value: string) => {
        setFeedback((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const sessionId = Cookies.get("token");
        if (!sessionId) {
            toast.error("Session ID (token) not found in cookies!");
            return;
        }

        const unanswered = Object.entries(feedback).filter(([_, value]) => value.trim() === "");
        if (unanswered.length > 0) {
            toast.error("Please answer all questions before submitting!");
            return;
        }

        const feedbackEntries = Object.entries(feedback);
        const questionsArray = feedbackEntries.map(([key]) => key);
        const answersArray = feedbackEntries.map(([_, value]) => value);

        try {
            await sendFeedback({ session_id: sessionId, questions: questionsArray, answers: answersArray }).unwrap();
            toast.success("Feedback submitted successfully!");
            setFeedbackStatus("Done"); // update status so form disappears
        } catch (err) {
            console.error("Failed to send feedback:", err);
            toast.error("Failed to send feedback. Please try again.");
        }
    };

    // ✅ Show loading while checking status
    if (statusLoading || feedbackStatus === null) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
            </Container>
        );
    }

    // ✅ If feedback is done, show thank you message
    if (feedbackStatus === "Done") {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Your feedback has been submitted. Thank you!
                </Typography>
            </Container>
        );
    }

    // ✅ Otherwise, show the feedback form
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Backdrop Loader */}
            <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
                <Typography variant="body1" sx={{ mt: 2 }}>Submitting your feedback...</Typography>
            </Backdrop>

            <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>User Feedback</Typography>

                {questions.map((question, index) => (
                    <Paper key={question.id} elevation={1} sx={{ p: 3, mb: 3, bgcolor: "white" }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Question {index + 1}</Typography>
                        <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>{question.text}</Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                row
                                value={feedback[question.id as keyof FeedbackData]}
                                onChange={(e) => handleRatingChange(question.id, e.target.value)}
                                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Strongly<br />disagree</Typography>
                                </Box>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <Box key={value} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Typography variant="caption" sx={{ mb: 0.5 }}>{value}</Typography>
                                        <FormControlLabel value={value.toString()} control={<Radio />} label="" sx={{ m: 0 }} />
                                    </Box>
                                ))}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Strongly<br />agree</Typography>
                                </Box>
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                ))}

                {/* Question 9 */}
                <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: "white" }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Question 9</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>What was the most valuable part of the tool for you?</Typography>
                    <TextField
                        fullWidth multiline rows={4} placeholder="Write your feedback here..."
                        value={feedback.mostValuable}
                        onChange={(e) => handleTextChange("mostValuable", e.target.value)}
                        variant="outlined"
                    />
                </Paper>

                {/* Question 10 */}
                <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: "white" }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Question 10</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>What was confusing, or missing in your experience?</Typography>
                    <TextField
                        fullWidth multiline rows={4} placeholder="Write your feedback here..."
                        value={feedback.confusing}
                        onChange={(e) => handleTextChange("confusing", e.target.value)}
                        variant="outlined"
                    />
                </Paper>

                <Button
                    variant="contained" fullWidth size="large"
                    onClick={handleSubmit} disabled={isLoading}
                    sx={{ bgcolor: "#2196f3", color: "white", py: 1.5, textTransform: "none", fontSize: "1rem", fontWeight: 500,
                        "&:hover": { bgcolor: "#1976d2" } }}
                >
                    {isLoading ? "Submitting..." : "Submit"}
                </Button>
            </Box>

            <Toaster position="top-right" reverseOrder={false} />
        </Container>
    );
};

export default FeedbackPage;