"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Box,
  Card,
  CardContent,
  TextField,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  Schedule,
  Send,
  AccessTime,
  Close,
  PhotoLibrary,
  Psychology,
} from "@mui/icons-material";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";

import { useCreateLinkedInPostMutation } from "@/redux/services/linkedin/linkedinPostApi";
import { useSchedulePostMutation } from "@/redux/services/linkedin/schedulePostApi";
import { useGenerateIdeaMutation } from "@/redux/services/linkedin/aiGenerateApi";
// import CustomSnackbar from "@/components/common/CustomSnackbar";

interface LinkedInPostProps {
  sub: string | null;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const LinkedInPostForm: React.FC<LinkedInPostProps> = ({ sub }) => {
  const [message, setMessage] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState<Dayjs | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
    icon?: React.ReactNode;
  }>({ open: false, severity: "success", message: "" });

  // API hooks
  const [createPost, { isLoading, isError, error, isSuccess }] =
    useCreateLinkedInPostMutation();
  const [
    schedulePost,
    { isLoading: isScheduling, isSuccess: scheduleSuccess },
  ] = useSchedulePostMutation();
  const [generateIdea, { isLoading: isGenerating }] = useGenerateIdeaMutation();

  /** ---------------- Utilities ------------------ */
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const cleaned = result.replace(/^data:image\/\w+;base64,/, "");
        resolve(cleaned);
      };
      reader.onerror = (err) => reject(err);
    });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const processFiles = (files: FileList) => {
    const maxImages = 10;
    const currentCount = selectedImages.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      setSnackbar({
        open: true,
        severity: "error",
        message: `Maximum ${maxImages} images allowed`,
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    filesToProcess.forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          severity: "error",
          message: `${file.name} is not a valid image format`,
        });
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        setSnackbar({
          open: true,
          severity: "error",
          message: `${file.name} is too large. Max size is 8MB`,
        });
        return;
      }

      const imageFile: ImageFile = {
        file,
        preview: URL.createObjectURL(file),
        id: generateId(),
      };

      setSelectedImages((prev) => [...prev, imageFile]);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const clearAllImages = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
  };

  /** ---------------- Build Payload ------------------ */
  const buildPayload = async () => {
    const storedSub =
      typeof window !== "undefined"
        ? localStorage.getItem("linkedin_sub")
        : null;

    if (!storedSub || !message.trim()) return null;

    let imagesPayload: { image: string }[] | undefined;
    if (selectedImages.length > 0) {
      imagesPayload = await Promise.all(
        selectedImages.map(async (imageFile) => {
          const base64 = await toBase64(imageFile.file);
          return { image: base64 };
        })
      );
    }

    return {
      sub: storedSub,
      message,
      ...(imagesPayload && { images: imagesPayload }),
    };
  };

  /** ---------------- Handlers ------------------ */
  const handlePost = async () => {
    try {
      const payload = await buildPayload();
      if (!payload) return;

      const response = await createPost({
        ...payload,
        post_message: payload.message,
      }).unwrap();

      if (response?.id) {
        setSnackbar({
          open: true,
          severity: "success",
          message: "Your post has been published successfully on LinkedIn!",
          icon: <CheckCircle />,
        });
        setMessage("");
        clearAllImages();
      }
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "An error occurred while creating your post",
      });
    }
  };

  const handleSchedule = async () => {
    try {
      const payload = await buildPayload();
      if (!payload || !scheduledDateTime) return;

      // ✅ Prevent past date/time
      if (dayjs(scheduledDateTime).isBefore(dayjs())) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "You cannot select a past time!",
        });
        return;
      }

      // UTC date (no manual offset needed)
      const utcDate = scheduledDateTime
        .toDate()
        .toISOString()
        .replace(/\.\d{3}Z$/, "+00:00");

      await schedulePost({
        ...payload,
        scheduled_time: utcDate, // always UTC
      }).unwrap();

      console.log("Scheduled Post Payload:", payload);
      console.log("Scheduled Time (UTC):", utcDate);

      setSnackbar({
        open: true,
        severity: "success",
        message: "Your post has been scheduled successfully!",
        icon: <Schedule />,
      });
      setMessage("");
      setScheduledDateTime(null);
      handleScheduleClose();
      clearAllImages();
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "An error occurred while scheduling your post",
      });
    }
  };

  const handleAIGenerate = async () => {
    try {
      const response = await generateIdea({
        prompt: message || "Generate an engaging LinkedIn post idea",
      }).unwrap();

      if (response?.groq_response) {
        setMessage(response.groq_response);
        setSnackbar({
          open: true,
          severity: "success",
          message: "AI suggestion generated successfully!",
          icon: <CheckCircle />,
        });
      }
    } catch (err) {
      console.error("AI Generate error:", err);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to generate idea. Please try again.",
      });
    }
  };

  const handleScheduleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleScheduleClose = () => setAnchorEl(null);

  /** ---------------- Effects ------------------ */
  useEffect(() => {
    if (isSuccess) {
      setSnackbar({
        open: true,
        severity: "success",
        message: "Post created successfully!",
        icon: <CheckCircle />,
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      setSnackbar({
        open: true,
        severity: "error",
        message: error ? JSON.stringify(error) : "Failed to create post",
      });
    }
  }, [isError, error]);

  useEffect(() => {
    if (scheduleSuccess) {
      setSnackbar({
        open: true,
        severity: "success",
        message: "Post scheduled successfully!",
        icon: <Schedule />,
      });
    }
  }, [scheduleSuccess]);

  /** ---------------- Render ------------------ */
  return (
    <Box display="flex" gap={3} alignItems="flex-start">
      {/* Main Card - Always visible */}
      <Box flex={selectedImages.length > 0 ? 2 : 1}>
        <Card
          elevation={0}
          sx={{
            background: "#ECECEC",
            borderRadius: 3,
            border: "none",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Create Tab Button */}
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#333",
              }}
            >
              Create
            </Typography>

            {/* Main Text Area */}
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  background: "#F6F6F6",
                  border: "none",
                  borderRadius: 2,
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#999",
                  opacity: 1,
                },
              }}
            />

            {/* Action Buttons */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Left side buttons */}
              <Box display="flex" gap={1.5}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoLibrary />}
                  size="small"
                  sx={{
                    background: "#EFF1FF",
                    border: "1px solid #5573AE",
                    color: "#5573AE",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      background: "#E5EDFF",
                      border: "1px solid #5573AE",
                    },
                  }}
                >
                  Add Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={handleScheduleClick}
                  size="small"
                  sx={{
                    background: "#EFF1FF",
                    border: "1px solid #5573AE",
                    color: "#5573AE",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      background: "#E5EDFF",
                      border: "1px solid #5573AE",
                    },
                  }}
                >
                  Schedule
                </Button>

                <Button
                  variant="contained"
                  onClick={handlePost}
                  disabled={isLoading || !message.trim()}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Send />
                    )
                  }
                  size="small"
                  sx={{
                    background:
                      "linear-gradient(266deg, #EC5188 -0.23%, #6489C4 93.46%)",
                    color: "white",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      background:
                        "linear-gradient(266deg, #EC5188 -0.23%, #6489C4 93.46%)",
                      opacity: 0.9,
                    },
                    "&:disabled": {
                      background: "#ccc",
                      color: "#999",
                    },
                  }}
                >
                  {isLoading ? "Posting..." : "Publish Post"}
                </Button>
              </Box>

              {/* Right side AI Generate button */}
              <Button
                variant="outlined"
                startIcon={
                  isGenerating ? <CircularProgress size={14} /> : <Psychology />
                }
                onClick={handleAIGenerate}
                disabled={isGenerating}
                size="small"
                sx={{
                  background: "#EFF1FF",
                  border: "1px solid #5573AE",
                  color: "#5573AE",
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  px: 2,
                  py: 1,
                  "&:hover": {
                    background: "#E5EDFF",
                    border: "1px solid #5573AE",
                  },
                }}
              >
                {isGenerating ? "Generating..." : "AI Generate"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Image Preview Card - Only visible when images are selected */}
      {selectedImages.length > 0 && (
        <Box flex={1} sx={{ minWidth: 300 }}>
          <Card
            elevation={0}
            sx={{
              background: "#E2EDF8",
              borderRadius: 3,
              border: "none",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Images Grid - 2 images per row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  mb: 3,
                }}
              >
                {selectedImages.map((img) => (
                  <Box key={img.id} sx={{ position: "relative" }}>
                    <img
                      src={img.preview}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      onClick={() => removeImage(img.id)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "white",
                        width: 24,
                        height: 24,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.9)",
                        },
                      }}
                    >
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Clear All Button */}
              <Button
                fullWidth
                onClick={clearAllImages}
                startIcon={<Close />}
                sx={{
                  background: "#EFF1FF",
                  border: "1px solid #5573AE",
                  color: "#FF3131",
                  borderRadius: 2,
                  "&:hover": {
                    background: "#E5EDFF",
                    border: "1px solid #5573AE",
                  },
                  "& .MuiButton-startIcon": {
                    color: "#FF3131",
                  },
                }}
              >
                Clear All
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Schedule Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleScheduleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ p: 3, width: 320 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Schedule Date & Time"
              value={scheduledDateTime}
              onChange={(newValue) => setScheduledDateTime(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />
          </LocalizationProvider>
          <Button
            fullWidth
            variant="contained"
            disabled={!scheduledDateTime || isScheduling}
            onClick={handleSchedule}
            startIcon={
              isScheduling ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AccessTime />
              )
            }
          >
            {isScheduling ? "Scheduling..." : "Schedule"}
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default LinkedInPostForm;
