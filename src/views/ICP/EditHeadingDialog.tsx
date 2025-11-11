"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  unifiedHeadingData,
  getDocumentTypeDisplayName,
} from "./data";

interface UnifiedEditHeadingDialogProps {
  open: boolean;
  onClose: () => void;
  documentType: string; // 'gtm', 'icp', 'kmf', 'bs', 'sr'
  projectId?: string; // Optional, can be retrieved from localStorage
  sessionId?: string; // Optional, can be retrieved from cookies
}

const UnifiedEditHeadingDialog: React.FC<UnifiedEditHeadingDialogProps> = ({
  open,
  onClose,
  documentType,
  projectId,
  sessionId,
}) => {
  const [mainHeading, setMainHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  const normalizedDocType = documentType.toLowerCase();
  const documentData = unifiedHeadingData[normalizedDocType];
  const isMultiLevel = Object.keys(documentData || {}).length > 1;

  // Reset fields when dialog closes
  useEffect(() => {
    if (!open) {
      setMainHeading("");
      setSubHeading("");
      setPrompt("");
    }
  }, [open]);

  // Auto-select main heading for single-level documents (icp, kmf, bs, sr)
  useEffect(() => {
    if (open && documentData && !isMultiLevel) {
      const firstKey = Object.keys(documentData)[0];
      setMainHeading(firstKey);
    }
  }, [open, documentData, isMultiLevel]);

  const handleSubmit = async () => {
    if (!mainHeading || !subHeading || !prompt) return;

    setLoading(true);
    try {
      // Get token from cookies
      const token =
        sessionId ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

      if (!token) throw new Error("Session ID not found in cookies");

      // Get project ID from localStorage or props
      const storedProject =
        typeof window !== "undefined"
          ? localStorage.getItem("currentProject")
          : null;
      const finalProjectId =
        projectId ||
        (storedProject ? JSON.parse(storedProject).project_id : "");

      const wsUrl = `wss://ybkbmzlbbd.execute-api.us-east-1.amazonaws.com/prod/?session_id=${token}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        const message = {
          action: "editHeading",
          session_id: token,
          project_id: finalProjectId,
          document_type: normalizedDocType,
          heading: isMultiLevel ? mainHeading : normalizedDocType,
          subheading: subHeading,
          prompt: prompt,
        };

        ws.send(JSON.stringify(message));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (
            msg.action === "sendMessage" &&
            msg.body.trim() === "Document generated successfully!"
          ) {
            setLoading(false);
            onClose();
            ws.close();
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setLoading(false);
      };

      ws.onclose = () => {
        setLoading(false);
      };
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  if (!documentData) {
    return null; // or show error message
  }

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
        Edit {getDocumentTypeDisplayName(documentType)} Document
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
      >
        {/* Main Heading - Only show for multi-level documents (GTM) */}
        {isMultiLevel && (
          <FormControl fullWidth>
            <Select
              displayEmpty
              value={mainHeading}
              onChange={(e) => {
                setMainHeading(e.target.value);
                setSubHeading(""); // Reset sub heading when main heading changes
              }}
              disabled={loading}
              sx={{
                borderRadius: 2,
                "& fieldset": { borderColor: "#ccc" },
                "&:hover fieldset": { borderColor: "primary.main" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              }}
            >
              <MenuItem value="" disabled>
                Select Main Heading
              </MenuItem>
              {Object.keys(documentData).map((heading) => (
                <MenuItem key={heading} value={heading}>
                  {heading}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Sub Heading */}
        <FormControl fullWidth>
          <Select
            displayEmpty
            value={subHeading}
            onChange={(e) => setSubHeading(e.target.value)}
            disabled={!mainHeading || loading}
            sx={{
              borderRadius: 2,
              "& fieldset": { borderColor: "#ccc" },
              "&:hover fieldset": { borderColor: "primary.main" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            }}
          >
            <MenuItem value="" disabled>
              {isMultiLevel ? "Select Sub Heading" : "Select Heading"}
            </MenuItem>
            {mainHeading &&
              documentData[mainHeading]?.map((sub) => (
                <MenuItem key={sub} value={sub}>
                  {sub}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {/* Prompt */}
        <TextField
          placeholder="Enter your prompt..."
          multiline
          rows={4}
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            "& fieldset": { borderColor: "#ccc" },
            "&:hover fieldset": { borderColor: "primary.main" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="secondary"
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!mainHeading || !subHeading || !prompt || loading}
          variant="contained"
          color="primary"
        >
          {loading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              Processing...
            </Box>
          ) : (
            "Submit"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnifiedEditHeadingDialog;