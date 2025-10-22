"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Paper,
    Chip,
    Divider,
    Alert,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LanguageIcon from "@mui/icons-material/Language";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { usePostWebScrapMutation } from "@/redux/services/webscrap/webscrapApi";
import Cookies from "js-cookie";

const DataUploadPage = () => {
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [postWebScrap, { isLoading, error, data }] = usePostWebScrapMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleWebsiteSubmit = async () => {
        if (!websiteUrl) {
            alert("Please enter a website URL.");
            return;
        }

        try {
            const session_id = Cookies.get("token");
            if (!session_id) {
                alert("Session expired. Please login again.");
                return;
            }

            const currentProject = localStorage.getItem("currentProject");
            if (!currentProject) {
                alert("Project not found. Please select a project.");
                return;
            }

            const project_id = JSON.parse(currentProject).project_id;

            const payload = {
                session_id,
                project_id,
                website: websiteUrl,
            };

            const response = await postWebScrap(payload).unwrap();
            console.log("API Response:", response);
            alert("Website data submitted successfully!");
            setWebsiteUrl(""); // Clear after success
        } catch (err) {
            console.error("API Error:", err);
            alert("Failed to submit website data.");
        }
    };

    const handleFileSubmit = () => {
        if (!selectedFile) {
            alert("Please upload a PDF file.");
            return;
        }
        console.log("PDF file submitted:", selectedFile);
        // Handle PDF processing logic here
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
                px: 3,
                py: 8,
            }}
        >
            <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
                {/* Header Section */}
                <Box sx={{ textAlign: "center", mb: 6 }}>
                    {/* <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                        <AutoAwesomeIcon
                            sx={{ fontSize: 48, color: "#1976d2", opacity: 0.9 }}
                        />
                    </Box> */}
                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 700,
                            fontSize: { xs: "28px", md: "36px" },
                            color: "#1a1a1a",
                            mb: 2,
                        }}
                    >
                       Build Data-Driven Marketing Strategies in Minutes
                    </Typography>
                </Box>


                {/* Website URL Section */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            boxShadow: "0px 8px 32px rgba(0,0,0,0.1)",
                        },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <LanguageIcon sx={{ fontSize: 28, color: "#1976d2" }} />
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 600,
                                fontSize: "22px",
                                color: "#1a1a1a",
                            }}
                        >
                            Your Website URL
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            color: "#666",
                            mb: 3,
                            lineHeight: 1.6,
                        }}
                    >
                        Provide your company website so our AI can analyze your products,
                        services, value propositions, and brand voice. This helps create
                        highly accurate and personalized marketing content.
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                        <TextField
                            placeholder="https://yourcompany.com"
                            variant="outlined"
                            fullWidth
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    fontFamily: "Poppins, sans-serif",
                                    backgroundColor: "#fafafa",
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LanguageIcon sx={{ color: "#999" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleWebsiteSubmit}
                            disabled={isLoading}
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "15px",
                                textTransform: "none",
                                px: 4,
                                py: 1.5,
                                borderRadius: "8px",
                                minWidth: { xs: "100%", sm: "140px" },
                                boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.3)",
                                "&:hover": {
                                    boxShadow: "0px 6px 16px rgba(25, 118, 210, 0.4)",
                                },
                            }}
                        >
                            {isLoading ? "Analyzing..." : "Submit"}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2, fontFamily: "Poppins, sans-serif" }}>
                            Failed to submit. Please check the URL and try again.
                        </Alert>
                    )}

                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: "#f9f9f9",
                            borderRadius: 2,
                            border: "1px dashed #ddd",
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "12px",
                                color: "#777",
                                fontStyle: "italic",
                            }}
                        >
                            💡 <strong>Example:</strong> https://slack.com,
                            https://notion.so, https://stripe.com
                        </Typography>
                    </Box>
                </Paper>

                {/* Divider with OR */}
                <Box sx={{ display: "flex", alignItems: "center", my: 4 }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography
                        sx={{
                            px: 3,
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#999",
                        }}
                    >
                        OR
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                </Box>

                {/* PDF Upload Section */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": {
                            boxShadow: "0px 8px 32px rgba(0,0,0,0.1)",
                        },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 28, color: "#1976d2" }} />
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontWeight: 600,
                                fontSize: "22px",
                                color: "#1a1a1a",
                            }}
                        >
                            Upload Business Documents
                        </Typography>
                    </Box>

                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            color: "#666",
                            mb: 3,
                            lineHeight: 1.6,
                        }}
                    >
                        Share existing marketing materials, product specs, pitch decks, or
                        strategic documents. Our AI will extract key insights to create
                        content that aligns perfectly with your business goals.
                    </Typography>

                    <Box
                        sx={{
                            border: "2px dashed #bdbdbd",
                            borderRadius: 2,
                            p: 4,
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: "#fafafa",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                backgroundColor: "#f0f0f0",
                                borderColor: "#1976d2",
                                borderStyle: "solid",
                            },
                        }}
                        component="label"
                    >
                        <AttachFileIcon
                            sx={{ fontSize: 20, color: "#1976d2", mb: 1.5 }}
                        />
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "16px",
                                color: selectedFile ? "#1976d2" : "#555",
                                fontWeight: selectedFile ? 600 : 400,
                                mb: 1,
                            }}
                        >
                            {selectedFile
                                ? `✓ ${selectedFile.name}`
                                : "Click to Upload or Drag & Drop"}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "13px",
                                color: "#999",
                            }}
                        >
                            PDF format • Max size 10MB
                        </Typography>
                        <input
                            type="file"
                            hidden
                            accept=".pdf"
                            onChange={handleFileChange}
                        />
                    </Box>

                    <Box sx={{ textAlign: "center", mt: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleFileSubmit}
                            disabled={!selectedFile}
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "15px",
                                textTransform: "none",
                                px: 5,
                                py: 1.5,
                                borderRadius: "8px",
                                boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.3)",
                                "&:hover": {
                                    boxShadow: "0px 6px 16px rgba(25, 118, 210, 0.4)",
                                },
                            }}
                        >
                            {selectedFile ? "Upload Document" : "Choose File First"}
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: "#f9f9f9",
                            borderRadius: 2,
                            border: "1px dashed #ddd",
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "12px",
                                color: "#777",
                                fontStyle: "italic",
                            }}
                        >
                            📄 <strong>What to upload:</strong> Company overviews, product
                            documentation, marketing briefs, competitive analysis, brand
                            guidelines, or pitch decks
                        </Typography>
                    </Box>
                </Paper>

                {/* Bottom Info Section */}
                <Paper
                    elevation={0}
                    sx={{
                        mt: 4,
                        p: 3,
                        borderRadius: 3,
                        background: "rgba(76, 175, 80, 0.05)",
                        border: "1px solid rgba(76, 175, 80, 0.2)",
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "13px",
                            color: "#2e7d32",
                            textAlign: "center",
                            lineHeight: 1.6,
                        }}
                    >
                        🔒 <strong>Your data is secure:</strong> All information is
                        encrypted and used solely to generate your personalized marketing
                        content. We never share your data with third parties.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default DataUploadPage;