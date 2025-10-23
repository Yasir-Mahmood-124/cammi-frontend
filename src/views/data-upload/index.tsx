"use client";
import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LanguageIcon from "@mui/icons-material/Language";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { usePostWebScrapMutation } from "@/redux/services/webscrap/webscrapApi";
import { useGetUploadUrlMutation } from "@/redux/services/webscrap/documentParcing";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

interface CurrentProject {
  organization_id: string;
  organization_name: string;
  project_id: string;
  project_name: string;
}

const DataUploadPage = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [postWebScrap, { isLoading }] = usePostWebScrapMutation();
  const [getUploadUrl] = useGetUploadUrlMutation();

  // -------------------------------
  // ✅ Helper: Validate Project & Organization
  // -------------------------------
  const validateProjectAndOrganization =
    useCallback((): CurrentProject | null => {
      try {
        const currentProject = localStorage.getItem("currentProject");
        if (!currentProject) {
          toast.error("Project not found. Please select a project first.");
          return null;
        }

        const projectData: CurrentProject = JSON.parse(currentProject);

        if (!projectData.organization_id || !projectData.project_id) {
          toast.error(
            "Invalid project configuration. Please select a valid project."
          );
          return null;
        }

        return projectData;
      } catch (error) {
        toast.error("Failed to load project information.");
        return null;
      }
    }, []);

  // -------------------------------
  // ✅ Helper: Validate Session
  // -------------------------------
  const validateSession = useCallback((): string | null => {
    const session_id = Cookies.get("token");
    if (!session_id) {
      toast.error("Session expired. Please login again.");
      return null;
    }
    return session_id;
  }, []);

  // -------------------------------
  // 📌 Handle File Select
  // -------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }

      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  // -------------------------------
  // 🌐 Handle Website Submission
  // -------------------------------
  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) {
      toast.error("Please enter a website URL.");
      return;
    }

    // Validate session and project
    const session_id = validateSession();
    if (!session_id) return;

    const projectData = validateProjectAndOrganization();
    if (!projectData) return;

    try {
      const payload = {
        session_id,
        project_id: projectData.project_id,
        organization_id: projectData.organization_id,
        website: websiteUrl,
      };

      await postWebScrap(payload).unwrap();
      toast.success("Website data submitted successfully!");
      setWebsiteUrl("");
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Failed to submit website data. Please try again.");
    }
  };

  // -------------------------------
  // 📄 Handle PDF Upload
  // -------------------------------
  const handleFileSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file first.");
      return;
    }

    // Validate session and project
    const session_id = validateSession();
    if (!session_id) return;

    const projectData = validateProjectAndOrganization();
    if (!projectData) return;

    try {
      setUploading(true);

      // Step 1: Get pre-signed URL
      const res = await getUploadUrl({
        session_id,
        filename: selectedFile.name,
        project_id: projectData.project_id,
      }).unwrap();

      console.log("Presigned URL Response:", res);

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(res.upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      console.log("✅ File uploaded successfully to:", res.s3_path);
      toast.success("Document uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("❌ Upload Error:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
  };

  // -------------------------------
  // 🖼️ UI
  // -------------------------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
        px: 3,
        py: 6,
      }}
    >
      <Box sx={{ maxWidth: "900px", mx: "auto" }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: { xs: "24px", md: "32px" },
              color: "#1a1a1a",
              mb: 1.5,
              lineHeight: 1.3,
            }}
          >
            Build Data-Driven Marketing Strategies
          </Typography>
          <Typography
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              fontSize: { xs: "14px", md: "16px" },
              color: "#666",
            }}
          >
            Import your website or documents to get started
          </Typography>
        </Box>

        {/* Website URL Section */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <LanguageIcon sx={{ fontSize: 24, color: "#1976d2" }} />
            <Typography
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                color: "#1a1a1a",
              }}
            >
              Website URL
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              placeholder="https://yourcompany.com"
              variant="outlined"
              fullWidth
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={isLoading}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon sx={{ color: "#999", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  backgroundColor: "#fafafa",
                  fontSize: "14px",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleWebsiteSubmit}
              disabled={isLoading || !websiteUrl.trim()}
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                textTransform: "none",
                px: 3,
                py: 1,
                borderRadius: 1.5,
                minWidth: "120px",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={16} sx={{ color: "white" }} />
                  Analyzing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Paper>

        {/* Divider */}
        <Box sx={{ display: "flex", alignItems: "center", my: 5 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography
            sx={{
              px: 3,
              fontFamily: "Poppins, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Or
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {/* PDF Upload Section */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <DescriptionIcon sx={{ fontSize: 24, color: "#1976d2" }} />
            <Typography
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                color: "#1a1a1a",
              }}
            >
              Upload Business Documents
            </Typography>
          </Box>

          {/* Upload Area */}
          <Box
            component="label"
            sx={{
              border: "2px dashed #e0e0e0",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              backgroundColor: selectedFile ? "#f0f7ff" : "#fafafa",
              transition: "all 0.2s ease",
              opacity: uploading ? 0.6 : 1,
              "&:hover": {
                borderColor: "#1976d2",
                backgroundColor: selectedFile ? "#f0f7ff" : "#f5f5f5",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {selectedFile ? (
                <>
                  <CheckCircleIcon
                    sx={{ fontSize: 40, color: "#4caf50", mb: 1.5 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "15px",
                      color: "#1a1a1a",
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </>
              ) : (
                <>
                  <CloudUploadIcon
                    sx={{ fontSize: 40, color: "#1976d2", mb: 1.5 }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "15px",
                      color: "#555",
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Click to upload or drag and drop
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    PDF format • Maximum 10MB
                  </Typography>
                </>
              )}
            </Box>
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Box>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 3, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              onClick={handleFileSubmit}
              disabled={!selectedFile || uploading}
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                textTransform: "none",
                px: 4,
                py: 1,
                borderRadius: 1.5,
                minWidth: "140px",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={16} sx={{ color: "white" }} />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 18 }} />
                  Upload Document
                </>
              )}
            </Button>

            {selectedFile && (
              <Button
                variant="outlined"
                onClick={handleClearFile}
                disabled={uploading}
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  textTransform: "none",
                  px: 4,
                  py: 1,
                  borderRadius: 1.5,
                  minWidth: "140px",
                }}
              >
                Clear Selection
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>

      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default DataUploadPage;
