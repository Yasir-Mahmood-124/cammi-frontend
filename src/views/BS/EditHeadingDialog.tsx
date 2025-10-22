"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
} from "@mui/material";
import { sectionsData } from "./data";


interface EditHeadingDialogProps {
  open: boolean;
  onClose: () => void;
  document_type: string;
}

const EditHeadingDialog: React.FC<EditHeadingDialogProps> = ({
  open,
  onClose,
  document_type,
}) => {
  const [headingLevel, setHeadingLevel] = useState("");
  const [headingText, setHeadingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  const socketRef = useRef<WebSocket | null>(null);

  const capitalizedDocType =
    document_type.charAt(0).toUpperCase() + document_type.slice(1).toLowerCase();

  // ✅ Reset fields when closed
  useEffect(() => {
    if (!open) {
      setHeadingLevel("");
      setHeadingText("");
    }
  }, [open]);

  const currentSection = sectionsData.find(
    (section) => section.section.toLowerCase() === document_type.toLowerCase()
  );

  // ✅ Listen for backend messages — only after socket is connected
  const attachMessageListener = (socket: WebSocket) => {
    socket.onmessage = (event: MessageEvent) => {
      console.log("📩 Received from backend:", event.data);

      try {
        const msg = JSON.parse(event.data);
        if (
          msg.action === "sendMessage" &&
          msg.body === "Document generated successfully!"
        ) {
          console.log("✅ Document generation complete!");
          setLoading(false);
          setSnackbarMsg("✅ Your document is ready!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          onClose();
          socket.close();
        }
      } catch (err) {
        console.error("❌ Error parsing message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setSnackbarMsg("⚠️ WebSocket connection failed");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setLoading(false);
    };
  };

// 🔹 Handle form submission
const handleSubmit = async () => {
  if (!headingLevel || !headingText) return;
  setLoading(true);

  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) throw new Error("Session ID not found in cookies");

    const storedProject =
      typeof window !== "undefined"
        ? localStorage.getItem("currentProject")
        : null;
    const projectId = storedProject ? JSON.parse(storedProject).project_id : "";

    const wsUrl = `wss://ybkbmzlbbd.execute-api.us-east-1.amazonaws.com/prod/?session_id=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected successfully");

      const message = {
        action: "editHeading",
        session_id: token,
        project_id: projectId,
        document_type: document_type.toLowerCase(), // ✅ All lowercase now
        heading: document_type.toLowerCase(),        // ✅ Same lowercase
        subheading: headingLevel,
        prompt: headingText,
      };

      ws.send(JSON.stringify(message));
      console.log("📤 Sent editHeading message:", message);
    };

    ws.onmessage = (event) => {
      console.log("📩 Received from backend:", event.data);
      try {
        const msg = JSON.parse(event.data);
        if (
          msg.action === "sendMessage" &&
          msg.body === "Document generated successfully!"
        ) {
          setLoading(false);
          setSnackbarMsg("✅ Your document is ready!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          onClose();
          ws.close();
        }
      } catch (err) {
        console.error("❌ Error parsing message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setSnackbarMsg("⚠️ WebSocket connection failed");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setLoading(false);
    };
  } catch (error) {
    console.error("❌ Error:", error);
    setSnackbarMsg("❌ Failed to send edit request");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    setLoading(false);
  }
};


  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.2rem" }}>
          Edit Your Document ({capitalizedDocType})
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Heading Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel shrink>Heading</InputLabel>
              <Select
                value={headingLevel}
                label="Heading"
                onChange={(e) => setHeadingLevel(e.target.value)}
                displayEmpty
                sx={{ "& .MuiSelect-select": { py: 1.5 } }}
              >
                <MenuItem value="" disabled>
                  Select a heading
                </MenuItem>

                {currentSection ? (
                  currentSection.items.map((item) => (
                    <MenuItem key={item.title} value={item.title}>
                      {item.title}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No headings available</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Heading Text */}
            <TextField
              label="Heading Text"
              fullWidth
              value={headingText}
              onChange={(e) => setHeadingText(e.target.value)}
              placeholder="Enter new heading text"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="error" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!headingText || !headingLevel || loading}
          >
            {loading ? <CircularProgress size={20} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditHeadingDialog;