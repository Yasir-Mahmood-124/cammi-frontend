"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Box,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import {
  AttachFile,
  Image as ImageIcon,
  Event,
  Close,
  ArrowForward,
  Schedule,
  AccessTime,
  CheckCircle,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "js-cookie";

import { useCreateLinkedInPostMutation } from "@/redux/services/linkedin/linkedinPostApi";
import { useSchedulePostMutation } from "@/redux/services/linkedin/schedulePostApi";
import { useGenerateIdeaMutation } from "@/redux/services/linkedin/aiGenerateApi";
import { useGenerateImageMutation } from "@/redux/services/linkedin/imageGeneration";

// LinkedIn Logo Component
const LinkedInLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#000000" />
    <path
      d="M7 9H9V17H7V9ZM8 6C7.45 6 7 6.45 7 7C7 7.55 7.45 8 8 8C8.55 8 9 7.55 9 7C9 6.45 8.55 6 8 6ZM11 9H13V10.07C13.33 9.45 14.19 9 15.13 9C17.03 9 17.5 10.17 17.5 12V17H15.5V12.5C15.5 11.67 15.17 11 14.33 11C13.33 11 13 11.83 13 12.5V17H11V9Z"
      fill="white"
    />
  </svg>
);

interface LinkedInPostProps {
  sub: string | null;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
  base64?: string;
}

const LinkedInPostForm: React.FC<LinkedInPostProps> = ({ sub }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [message, setMessage] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState<Dayjs | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [
    generateImage,
    { data: generatedImage, isLoading: isImageGenerating, error: imageError },
  ] = useGenerateImageMutation();

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
          if (imageFile.base64) {
            // 👈 Directly use already-stored base64 for generated images
            return { image: imageFile.base64 };
          } else {
            // 👈 For uploaded images, convert File to base64
            const base64 = await toBase64(imageFile.file);
            return { image: base64 };
          }
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
      console.log("Payload for post:", payload);
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

      if (dayjs(scheduledDateTime).isBefore(dayjs())) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "You cannot select a past time!",
        });
        return;
      }

      const utcDate = scheduledDateTime
        .toDate()
        .toISOString()
        .replace(/\.\d{3}Z$/, "+00:00");

      await schedulePost({
        ...payload,
        scheduled_time: utcDate,
      }).unwrap();

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

  const handleRefine = async () => {
    try {
      const response = await generateIdea({
        prompt: message || "Generate an engaging LinkedIn post idea",
      }).unwrap();

      if (response?.final_response) {
        setMessage(response.final_response);
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

 const handleImageGenerate = async () => {
  try {
    const token = Cookies.get("token");

    if (!token) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Session expired. Please log in again.",
      });
      return;
    }

    const response = await generateImage({
      session_id: token,
      prompt: imagePrompt,
    }).unwrap();

    if (response?.image_base64) {
      setSnackbar({
        open: true,
        severity: "success",
        message: "Image generated successfully!",
        icon: <CheckCircle />,
      });

      const cleanBase64 = response.image_base64.replace(
        /^data:application\/octet-stream;base64,/,
        ""
      );

      // 👇 Save just like uploaded images (both preview and base64)
      const newImage: ImageFile = {
        file: new File([], "generated.png"), // dummy File object
        preview: `data:image/png;base64,${cleanBase64}`,
        base64: cleanBase64,
        id: generateId(),
      };

      setSelectedImages((prev) => [...prev, newImage]);
    }
  } catch (err) {
    console.error("Image generation error:", err);
    setSnackbar({
      open: true,
      severity: "error",
      message: "Failed to generate image. Please try again.",
    });
  }
};


  const handleScheduleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleScheduleClose = () => setAnchorEl(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              fontFamily: "Poppins, sans-serif",
              color: "#000",
              letterSpacing: "-0.5px",
            }}
          >
            LinkedIn Post
          </Typography>
          <LinkedInLogo />
        </Box>
        <Typography
          sx={{
            fontSize: "14px",
            color: "#666",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Craft engaging post that drives result
        </Typography>
      </Box>

      {/* Main Card with Gradient Border */}
      <Box
        sx={{
          background: "#fff",
          borderRadius: 4,
          border: "3px solid transparent",
          backgroundImage:
            "linear-gradient(white, white), linear-gradient(135deg, #3EA3FF 0%, #9C6FDE 50%, #FF5E9D 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: "1px solid #E8E8E8", px: 3, pt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
                color: "#999",
                minHeight: 40,
                px: 2,
                "&.Mui-selected": {
                  color: "#000",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                background:
                  "linear-gradient(90deg, #3EA3FF 0%, #9C6FDE 50%, #FF5E9D 100%)",
              },
            }}
          >
            <Tab label="Create Post" />
            <Tab label="Image Generation" />
          </Tabs>
        </Box>

        {/* Content Area - Horizontal Layout */}
        <Box sx={{ display: "flex", p: 3, gap: 3 }}>
          {/* Left Side - Text Area and Buttons */}
          <Box sx={{ flex: 1 }}>
            {activeTab === 0 ? (
              <>
                {/* Create Post Text Area */}
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  placeholder="What do you want to post about?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{
                    mb: 2.5,
                    "& .MuiOutlinedInput-root": {
                      background: "#F8F8F8",
                      border: "1px solid #D9D9D9",
                      borderRadius: "12px",
                      fontFamily: "Poppins, sans-serif",
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
                    "& .MuiInputBase-input": {
                      fontSize: "14px",
                      color: "#333",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#999",
                      opacity: 1,
                    },
                  }}
                />

                {/* Bottom Actions */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Refine Button */}
                  <Button
                    variant="contained"
                    onClick={handleRefine}
                    disabled={isGenerating}
                    startIcon={
                      isGenerating ? <CircularProgress size={14} /> : null
                    }
                    sx={{
                      background:
                        "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                      color: "#fff",
                      borderRadius: "25px",
                      fontSize: "13px",
                      fontWeight: 500,
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontFamily: "Poppins, sans-serif",
                      boxShadow: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                        opacity: 0.9,
                        boxShadow: "none",
                      },
                    }}
                  >
                    {isGenerating ? "Refining..." : "Refine"}
                  </Button>

                  {/* Right Side Icons and Post Button */}
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <IconButton
                      sx={{
                        bgcolor: "transparent",
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      <AttachFile sx={{ fontSize: 22, color: "#666" }} />
                    </IconButton>

                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: "transparent",
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 22, color: "#666" }} />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                    </IconButton>

                    <IconButton
                      onClick={handleScheduleClick}
                      sx={{
                        bgcolor: "transparent",
                        "&:hover": { bgcolor: "#f5f5f5" },
                      }}
                    >
                      <Event sx={{ fontSize: 22, color: "#666" }} />
                    </IconButton>

                    <Button
                      variant="contained"
                      onClick={handlePost}
                      disabled={isLoading || !message.trim()}
                      endIcon={
                        isLoading ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <ArrowForward sx={{ fontSize: 16 }} />
                        )
                      }
                      sx={{
                        background: "#3EA3FF",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 500,
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        fontFamily: "Poppins, sans-serif",
                        boxShadow: "none",
                        "&:hover": {
                          background: "#3EA3FF",
                          opacity: 0.9,
                          boxShadow: "none",
                        },
                        "&:disabled": {
                          background: "#ccc",
                          color: "#999",
                        },
                      }}
                    >
                      {isLoading ? "Posting..." : "Post"}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                {/* Image Generation Text Area */}
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  placeholder="Generate an image by entering a prompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  sx={{
                    mb: 2.5,
                    "& .MuiOutlinedInput-root": {
                      background: "#F8F8F8",
                      border: "1px solid #D9D9D9",
                      borderRadius: "12px",
                      fontFamily: "Poppins, sans-serif",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "14px",
                      color: "#333",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#999",
                      opacity: 1,
                    },
                  }}
                />

                {/* Generate Button - Centered */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={handleImageGenerate}
                    disabled={!imagePrompt.trim()}
                    sx={{
                      background:
                        "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                      color: "#fff",
                      borderRadius: "25px",
                      fontSize: "14px",
                      fontWeight: 500,
                      px: 5,
                      py: 1.2,
                      textTransform: "none",
                      fontFamily: "Poppins, sans-serif",
                      boxShadow: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                        opacity: 0.9,
                        boxShadow: "none",
                      },
                      "&:disabled": {
                        background: "#ccc",
                        color: "#999",
                      },
                    }}
                  >
                    {isImageGenerating ? "Generating..." : "Generate"}
                  </Button>
                </Box>
              </>
            )}
          </Box>

          {/* Right Side - Image Preview */}
          {selectedImages.length > 0 && (
            <Box
              sx={{
                width: 280,
                background: "#EFF1F5",
                borderRadius: "16px",
                p: 2.5,
              }}
            >
              {/* Images Grid - 2x3 */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                {selectedImages.map((img) => (
                  <Box
                    key={img.id}
                    sx={{
                      position: "relative",
                      paddingTop: "100%",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={img.preview}
                      alt="preview"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
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
                        width: 20,
                        height: 20,
                        padding: 0,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.85)",
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
                startIcon={<Close sx={{ fontSize: 16 }} />}
                sx={{
                  background: "#FFFFFF",
                  color: "#000",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  py: 0.8,
                  textTransform: "none",
                  fontFamily: "Poppins, sans-serif",
                  border: "1px solid #E0E0E0",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#F8F8F8",
                    boxShadow: "none",
                  },
                }}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Box>
      </Box>

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
            sx={{
              background: "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                opacity: 0.9,
                boxShadow: "none",
              },
            }}
          >
            {isScheduling ? "Scheduling..." : "Schedule"}
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default LinkedInPostForm;
