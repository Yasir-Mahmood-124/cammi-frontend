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
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box,
} from "@mui/material";
import { headingData } from "./data";
import {
    useConnectWebSocketMutation,
    useSendEditHeadingMutation,
    useDisconnectWebSocketMutation,
} from "@/redux/services/common/editHeadingWebsocketApi";


interface EditHeadingDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    sessionId: string;
    documentType: string;
}

const EditHeadingDialog: React.FC<EditHeadingDialogProps> = ({
    open,
    onClose,
    projectId,
    sessionId,
    documentType,
}) => {
    const [mainHeading, setMainHeading] = useState("");
    const [subHeading, setSubHeading] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [connectWebSocket] = useConnectWebSocketMutation();
    const [disconnectWebSocket] = useDisconnectWebSocketMutation();
    const [sendEditHeading] = useSendEditHeadingMutation();

    const socketRef = useRef<WebSocket | null>(null);

    // 🔹 Attach WebSocket message listener
    useEffect(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;

        const handleMessage = (event: MessageEvent) => {
            console.log("📩 Raw WebSocket event:", event.data);
            try {
                const msg = JSON.parse(event.data);
                console.log("✅ Parsed message:", msg);

                // Debug exact matching check
                console.log("Action:", msg.action);
                console.log("Body:", msg.body);

                if (
                    msg.action === "sendMessage" &&
                    msg.body.trim() === "Document generated successfully!"
                ) {
                    console.log("🎉 Match found! Closing dialog.");
                    setLoading(false);
                    setSnackbarOpen(true);
                    onClose();
                    socket.close();
                } else {
                    console.log("⚠️ Message received but didn’t match expected format.");
                }
            } catch (err) {
                console.error("❌ Error parsing message:", err);
            }
        };


        socket.addEventListener("message", handleMessage);
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [onClose]);

    // 🔹 Handle form submission
    const handleSubmit = async () => {
        if (!mainHeading || !subHeading || !prompt) return;

        setLoading(true);
        try {
            // 1️⃣ Connect WebSocket
            const token = document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1];

            if (!token) throw new Error("Session ID not found in cookies");

            const wsUrl = `wss://ybkbmzlbbd.execute-api.us-east-1.amazonaws.com/prod/?session_id=${token}`;
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = async () => {
                console.log("✅ WebSocket connected successfully");

                const message = {
                    action: "editHeading",
                    session_id: sessionId,
                    project_id: projectId,
                    document_type: documentType,
                    heading: mainHeading,
                    subheading: subHeading,
                    prompt: prompt,
                };

                // 2️⃣ Send message after connected
                ws.send(JSON.stringify(message));
                console.log("📤 Sent editHeading message:", message);
            };

            ws.onerror = (err) => {
                console.error("❌ WebSocket error:", err);
                setLoading(false);
            };

            ws.onclose = () => {
                console.log("🔌 WebSocket disconnected");
            };
        } catch (error) {
            console.error("❌ Error:", error);
            setLoading(false);
        }
    };

    // ✅ Reset fields whenever the dialog closes
    useEffect(() => {
        if (!open) {
            setMainHeading("");
            setSubHeading("");
            setPrompt("");
        }
    }, [open]);

    const handleSnackbarClose = () => setSnackbarOpen(false);

    return (
        <>
            <Dialog
                open={open}
                onClose={!loading ? onClose : undefined}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
                    Edit Document Heading
                </DialogTitle>

                <DialogContent
                    sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
                >
                    {/* Main Heading */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <Select
                            displayEmpty
                            value={mainHeading}
                            onChange={(e) => {
                                setMainHeading(e.target.value);
                                setSubHeading("");
                            }}
                            disabled={loading}
                            sx={{
                                borderRadius: 2,
                                "& .MuiSelect-outlined": {
                                    padding: "10px 14px",
                                },
                                "& fieldset": { borderColor: "#ccc" },
                                "&:hover fieldset": { borderColor: "primary.main" },
                                "&.Mui-focused fieldset": { borderColor: "primary.main" },
                            }}
                        >
                            <MenuItem value="" disabled>
                                Select Main Heading
                            </MenuItem>
                            {Object.keys(headingData).map((heading) => (
                                <MenuItem key={heading} value={heading}>
                                    {heading}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Sub Heading */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
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
                                Select Sub Heading
                            </MenuItem>
                            {mainHeading &&
                                headingData[mainHeading]?.map((sub) => (
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
                        rows={3}
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
                            "& .MuiInputBase-input": {
                                padding: "12px",
                            },
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
                        disabled={loading}
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
        </>
    );
};

export default EditHeadingDialog;