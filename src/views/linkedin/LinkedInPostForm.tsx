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
  CloudUpload,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";

import { useCreateLinkedInPostMutation } from "@/redux/services/linkedin/linkedinPostApi";
import { useSchedulePostMutation } from "@/redux/services/linkedin/schedulePostApi";
import { useGenerateIdeaMutation } from "@/redux/services/linkedin/aiGenerateApi";
import { useGenerateImageMutation } from "@/redux/services/linkedin/imageGeneration";

// LinkedIn Logo Component
const LinkedInLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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

interface ImageGenUpload {
  file: File;
  preview: string;
  id: string;
  mime_type: string;
  data: string;
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
  const [imageGenUploads, setImageGenUploads] = useState<ImageGenUpload[]>([]);

  const [
    generateImage,
    { data: generatedImage, isLoading: isImageGenerating, error: imageError },
  ] = useGenerateImageMutation();

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

  const toBase64WithPrefix = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => reject(err);
    });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const processFiles = (files: FileList) => {
    const maxImages = 10;
    const currentCount = selectedImages.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];

    filesToProcess.forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 8MB`);
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

  const processImageGenFiles = async (files: FileList) => {
    const maxImages = 2;
    const currentCount = imageGenUploads.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed for image generation`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];

    for (const file of filesToProcess) {
      if (!validImageTypes.includes(file.type)) {
        toast.error(
          `${file.name} is not a valid format. Only PNG and JPG are allowed`
        );
        continue;
      }

      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 8MB`);
        continue;
      }

      try {
        const base64WithPrefix = await toBase64WithPrefix(file);

        const imageGenFile: ImageGenUpload = {
          file,
          preview: URL.createObjectURL(file),
          id: generateId(),
          mime_type: file.type,
          data: base64WithPrefix,
        };

        setImageGenUploads((prev) => [...prev, imageGenFile]);
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleImageGenUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageGenFiles(e.target.files);
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

  const removeImageGenUpload = (id: string) => {
    setImageGenUploads((prev) => {
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

  const clearImageGenUploads = () => {
    imageGenUploads.forEach((img) => URL.revokeObjectURL(img.preview));
    setImageGenUploads([]);
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
            return { image: imageFile.base64 };
          } else {
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
      if (!payload) return;

      const response = await createPost({
        ...payload,
        post_message: payload.message,
      }).unwrap();

      if (response?.id) {
        toast.success("Your post has been published successfully on LinkedIn!");
        setMessage("");
        clearAllImages();
      }
    } catch {
      toast.error("An error occurred while creating your post");
    }
  };

  const handleSchedule = async () => {
    try {
      const payload = await buildPayload();
      if (!payload || !scheduledDateTime) return;

      if (dayjs(scheduledDateTime).isBefore(dayjs())) {
        toast.error("You cannot select a past time!");
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

      toast.success("Your post has been scheduled successfully!");
      setMessage("");
      setScheduledDateTime(null);
      handleScheduleClose();
      clearAllImages();
    } catch {
      toast.error("An error occurred while scheduling your post");
    }
  };

  const handleRefine = async () => {
    try {
      const sessionId = Cookies.get("token");

      if (!sessionId) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const currentProject = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      );
      const organizationId = currentProject.organization_id;

      const response = await generateIdea({
        prompt: message || "Generate an engaging LinkedIn post idea",
        organization_id: organizationId || "",
        session_id: sessionId,
      }).unwrap();

      if (response?.final_response) {
        setMessage(response.final_response);
        toast.success("AI suggestion generated successfully!");
      }
    } catch (err) {
      toast.error("Failed to generate idea. Please try again.");
    }
  };

const handleImageGenerate = async () => {
  try {
    const token = Cookies.get("token");

    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    // Validate inputs
    if (!imagePrompt.trim() && imageGenUploads.length === 0) {
      toast.error("Please provide a prompt or upload reference images.");
      return;
    }

    const requestPayload: any = {
      session_id: token,
    };

    if (imagePrompt.trim()) {
      requestPayload.prompt = imagePrompt;
    }

    if (imageGenUploads.length > 0) {
      requestPayload.images = imageGenUploads.map((img) => ({
        mime_type: img.mime_type,
        data: img.data,
      }));
    }

    // Show loading toast with timeout warning
    const loadingToast = toast.loading(
      "Generating image... This may take up to 30 seconds."
    );

    const response = await generateImage(requestPayload).unwrap();

    toast.dismiss(loadingToast);

    if (response?.image_base64) {
      toast.success("Image generated successfully!");

      const cleanBase64 = response.image_base64.replace(
        /^data:application\/octet-stream;base64,/,
        ""
      );

      const newImage: ImageFile = {
        file: new File([], "generated.png"),
        preview: `data:image/png;base64,${cleanBase64}`,
        base64: cleanBase64,
        id: generateId(),
      };

      setSelectedImages((prev) => [...prev, newImage]);
      setImagePrompt("");
      clearImageGenUploads();
      setActiveTab(0);
    }
  } catch (err: any) {
    console.error("Image generation error:", err);

    // Handle specific error cases
    let errorMessage = "Failed to generate image. Please try again.";

    if (err?.status === 502 || err?.status === 503 || err?.status === 504) {
      errorMessage =
        "Server is temporarily busy. Please try again in a moment.";
    } else if (err?.status === 404) {
      errorMessage =
        "Image generation service unavailable. Please contact support.";
    } else if (err?.status === 429) {
      errorMessage =
        "Too many requests. Please wait a moment before trying again.";
    } else if (err?.status === "FETCH_ERROR") {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (err?.data?.message) {
      errorMessage = err.data.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }

    toast.error(errorMessage);
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
      toast.success("Post created successfully!");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error(error ? JSON.stringify(error) : "Failed to create post");
    }
  }, [isError, error]);

  useEffect(() => {
    if (scheduleSuccess) {
      toast.success("Post scheduled successfully!");
    }
  }, [scheduleSuccess]);

  /** ---------------- Render ------------------ */
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 1.5 }}>
      {/* Header */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              fontSize: "22px",
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
            fontSize: "12px",
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
          borderRadius: 3,
          border: "2px solid transparent",
          backgroundImage:
            "linear-gradient(white, white), linear-gradient(135deg, #3EA3FF 0%, #9C6FDE 50%, #FF5E9D 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: "1px solid #E8E8E8", px: 1.5, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 32,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
                color: "#999",
                minHeight: 32,
                px: 1.5,
                py: 0.5,
                "&.Mui-selected": {
                  color: "#000",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 2,
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
        <Box
          sx={{
            display: "flex",
            p: 1.5,
            gap: 1.5,
          }}
        >
          {/* Left Side - Text Area and Buttons */}
          <Box
            sx={{
              flex: 1,
            }}
          >
            {activeTab === 0 ? (
              <>
                {/* Create Post Text Area */}
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="What do you want to post about?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                      background: "#F8F8F8",
                      border: "1px solid #D9D9D9",
                      borderRadius: "10px",
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
                      fontSize: "13px",
                      color: "#333",
                      overflow: "hidden !important",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#999",
                      opacity: 1,
                    },
                    "& textarea": {
                      overflow: "hidden !important",
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
                      isGenerating ? <CircularProgress size={10} /> : null
                    }
                    sx={{
                      background:
                        "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                      color: "#fff",
                      borderRadius: "18px",
                      fontSize: "11px",
                      fontWeight: 500,
                      px: 2,
                      py: 0.6,
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
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: "transparent",
                        "&:hover": { bgcolor: "#f5f5f5" },
                        p: 0.6,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 18, color: "#666" }} />
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
                        p: 0.6,
                      }}
                    >
                      <Event sx={{ fontSize: 18, color: "#666" }} />
                    </IconButton>

                    <Button
                      variant="contained"
                      onClick={handlePost}
                      disabled={isLoading || !message.trim()}
                      endIcon={
                        isLoading ? (
                          <CircularProgress size={10} color="inherit" />
                        ) : (
                          <ArrowForward sx={{ fontSize: 12 }} />
                        )
                      }
                      sx={{
                        background: "#3EA3FF",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 500,
                        px: 2,
                        py: 0.6,
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
                {/* Image Generation Section */}
                <Box>
                  {/* Text Area */}
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="💡 Pro Tip: Write a smart prompt that clearly explains your Goal, Target audience, and Creative intent. The more context you give, the more precise and impactful your image will be..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    sx={{
                      mb: 1.5,
                      "& .MuiOutlinedInput-root": {
                        background: "#F8F8F8",
                        border: "1px solid #D9D9D9",
                        borderRadius: "10px",
                        fontFamily: "Poppins, sans-serif",
                        "& fieldset": {
                          border: "none",
                        },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "12px",
                        color: "#333",
                        overflow: "hidden !important",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#999",
                        opacity: 1,
                      },
                      "& textarea": {
                        overflow: "hidden !important",
                      },
                    }}
                  />

                  {/* Upload Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#666",
                        mb: 0.8,
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Upload Reference Images (Optional - Max 2, PNG/JPG only)
                    </Typography>

                    {/* Upload Button */}
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={imageGenUploads.length >= 2}
                      startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: "8px",
                        border: "2px dashed #D9D9D9",
                        color: "#666",
                        fontSize: "11px",
                        fontWeight: 500,
                        px: 1.5,
                        py: 0.8,
                        textTransform: "none",
                        fontFamily: "Poppins, sans-serif",
                        minWidth: 120,
                        height: 60,
                        "&:hover": {
                          border: "2px dashed #3EA3FF",
                          background: "#F8F8F8",
                        },
                        "&:disabled": {
                          border: "2px dashed #E0E0E0",
                          color: "#999",
                        },
                      }}
                    >
                      {imageGenUploads.length === 0
                        ? "Upload Images"
                        : `${imageGenUploads.length}/2 Uploaded`}
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={handleImageGenUpload}
                        style={{ display: "none" }}
                      />
                    </Button>
                  </Box>

                  {/* Generate Button - Centered */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
                    <Button
                      variant="contained"
                      onClick={handleImageGenerate}
                      disabled={
                        isImageGenerating ||
                        (!imagePrompt.trim() && imageGenUploads.length === 0)
                      }
                      startIcon={
                        isImageGenerating ? (
                          <CircularProgress size={12} color="inherit" />
                        ) : null
                      }
                      sx={{
                        background:
                          "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
                        color: "#fff",
                        borderRadius: "18px",
                        fontSize: "12px",
                        fontWeight: 500,
                        px: 3,
                        py: 0.8,
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
                      {isImageGenerating ? "Generating..." : "Generate Image"}
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>

          {/* Right Side - Image Preview (Visible on BOTH tabs when images present) */}
          {(selectedImages.length > 0 || (activeTab === 1 && imageGenUploads.length > 0)) && (
            <Box
              sx={{
                width: 200,
                background: "#EFF1F5",
                borderRadius: "10px",
                p: 1.5,
              }}
            >
              {/* Title */}
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#333",
                  mb: 1,
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {activeTab === 0 ? "Images to Post" : "Reference Images"}
              </Typography>

              {/* Images Grid - 2x3 */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1,
                  mb: 1,
                }}
              >
                {activeTab === 0
                  ? selectedImages.map((img) => (
                      <Box
                        key={img.id}
                        sx={{
                          position: "relative",
                          paddingTop: "100%",
                          borderRadius: "8px",
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
                            top: 2,
                            right: 2,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "white",
                            width: 18,
                            height: 18,
                            padding: 0,
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.85)",
                            },
                          }}
                        >
                          <Close sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))
                  : imageGenUploads.map((img) => (
                      <Box
                        key={img.id}
                        sx={{
                          position: "relative",
                          paddingTop: "100%",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={img.preview}
                          alt="reference"
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
                          onClick={() => removeImageGenUpload(img.id)}
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "white",
                            width: 18,
                            height: 18,
                            padding: 0,
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.85)",
                            },
                          }}
                        >
                          <Close sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
              </Box>

              {/* Clear All Button */}
              <Button
                fullWidth
                onClick={activeTab === 0 ? clearAllImages : clearImageGenUploads}
                startIcon={<Close sx={{ fontSize: 12 }} />}
                sx={{
                  background: "#FFFFFF",
                  color: "#000",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 500,
                  py: 0.5,
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
        <Box sx={{ p: 2, width: 280 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Schedule Date & Time"
              value={scheduledDateTime}
              onChange={(newValue) => setScheduledDateTime(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 1.2 } } }}
            />
          </LocalizationProvider>
          <Button
            fullWidth
            variant="contained"
            disabled={!scheduledDateTime || isScheduling}
            onClick={handleSchedule}
            startIcon={
              isScheduling ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <AccessTime />
              )
            }
            sx={{
              background: "linear-gradient(90deg, #DA5B91 0%, #5D89C7 100%)",
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              fontSize: "11px",
              py: 0.7,
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