"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDriveFileRenameOutline, MdDelete } from "react-icons/md";
import {
  useGetReviewsMutation,
  Review,
} from "@/redux/services/documentReview/reviewApi";
import { useGetUserDocumentsMutation } from "@/redux/services/document/documentsApi";
import { useGetSpecificDocumentMutation } from "@/redux/services/document/getSpecificDocument";
import { useEditDocumentNameMutation } from "@/redux/services/document/editDocumentNameApi";
import { useDeleteDocumentMutation } from "@/redux/services/document/deleteDocumentApi";
import Cookies from "js-cookie";
import GenericDocumentPreview from "@/components/GenericDocumentPreview";
import toast from "react-hot-toast";

interface DocumentItem {
  document_id?: string;
  document_type_uuid?: string;
  document_type?: string;
  document_name?: string;
  document_url?: string;
  createdAt?: string;
  created_at?: string;
  user_id?: string;
}

const DashboardPage = () => {
  const [getReviews, { data, isLoading, error }] = useGetReviewsMutation();
  const [
    getUserDocuments,
    { data: documentsData, isLoading: documentsLoading, error: documentsError },
  ] = useGetUserDocumentsMutation();

  const [
    getSpecificDocument,
    {
      data: specificDocumentData,
      isLoading: documentPreviewLoading,
      error: documentPreviewError,
    },
  ] = useGetSpecificDocumentMutation();

  const [
    editDocumentName,
    { isLoading: isEditingName },
  ] = useEditDocumentNameMutation();

  const [
    deleteDocument,
    { isLoading: isDeletingDocument },
  ] = useDeleteDocumentMutation();

  // State for document preview
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null
  );
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // State for See More/See Less functionality
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [documentsPerRow, setDocumentsPerRow] = useState(7);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // State for editing document name
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editingDocumentName, setEditingDocumentName] = useState("");

  // State for three-dot menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuDocument, setSelectedMenuDocument] = useState<DocumentItem | null>(null);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null);

  // Calculate documents per row based on screen width
  useEffect(() => {
    const calculateDocumentsPerRow = () => {
      const screenWidth = window.innerWidth;
      
      // Subtract sidebar width (approximately 250px) and padding
      const availableWidth = screenWidth - 250 - 64; // 64px for px: 4 (32px each side)
      
      // Each document card is 105px wide + 9.6px gap (1.2 * 8px)
      const cardWidth = 105 + 9.6;
      
      // Calculate how many cards can fit
      const cardsPerRow = Math.floor(availableWidth / cardWidth);
      
      // Set minimum of 5 and maximum based on calculation
      const finalCount = Math.max(5, Math.min(cardsPerRow, 15));
      
      setDocumentsPerRow(finalCount);
    };

    // Calculate on mount and on window resize
    calculateDocumentsPerRow();
    window.addEventListener('resize', calculateDocumentsPerRow);

    return () => window.removeEventListener('resize', calculateDocumentsPerRow);
  }, []);

  useEffect(() => {
    getReviews();

    // Get session_id from cookies
    const sessionId = Cookies.get("token");

    if (sessionId) {
      getUserDocuments({
        session_id: sessionId,
      });
    } else {
      console.error("Session ID not found in cookies");
    }
  }, []);

  // Log document structure when documents arrive
  useEffect(() => {
    if (documentsData?.documents && documentsData.documents.length > 0) {
      console.log("First document structure:", JSON.stringify(documentsData.documents[0], null, 2));
      console.log("All document keys:", Object.keys(documentsData.documents[0]));
    }
  }, [documentsData]);

  // Helper function to get document unique identifier
  const getDocumentId = (doc: DocumentItem): string | null => {
    return doc.document_id || 
           doc.document_type_uuid || 
           doc.document_url ||
           doc.document_name ||
           null;
  };

  // Handle document card click - open document
  const handleDocumentClick = async (doc: DocumentItem) => {
    const docId = getDocumentId(doc);
    
    if (loadingDocumentId === docId || editingDocumentId === docId) {
      return;
    }

    // Show loading overlay immediately
    setShowLoadingOverlay(true);

    try {
      // Set loading state for this specific document
      setLoadingDocumentId(docId);
      setSelectedDocument(doc);

      // Get user_id from localStorage or wherever it's stored
      const userDataString = localStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.user_id || doc.user_id;

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        setLoadingDocumentId(null);
        setShowLoadingOverlay(false);
        return;
      }

      // Get document_type_uuid - could be document_id or a separate field
      const documentTypeUuid = doc.document_type_uuid || doc.document_id;

      if (!documentTypeUuid) {
        toast.error("Document ID not found.");
        setLoadingDocumentId(null);
        setShowLoadingOverlay(false);
        return;
      }

      console.log("Fetching document:", { userId, documentTypeUuid });

      // Fetch the specific document
      await getSpecificDocument({
        user_id: userId,
        document_type_uuid: documentTypeUuid,
      }).unwrap();

      // Show the preview
      setShowPreview(true);
      setLoadingDocumentId(null);
      setShowLoadingOverlay(false);
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to load document. Please try again.");
      setLoadingDocumentId(null);
      setShowLoadingOverlay(false);
    }
  };

  // Handle three-dot menu click
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, doc: DocumentItem) => {
    e.stopPropagation();
    console.log("Menu clicked for document:", doc);
    console.log("Document keys:", Object.keys(doc));
    setMenuAnchorEl(e.currentTarget);
    setSelectedMenuDocument(doc);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuDocument(null);
  };

  // Handle rename click from menu
  const handleRenameClick = () => {
    console.log("Rename clicked!");
    console.log("Full selected document:", JSON.stringify(selectedMenuDocument, null, 2));
    
    if (selectedMenuDocument) {
      // Try to find any unique identifier
      const docId = getDocumentId(selectedMenuDocument);
      
      console.log("Setting editing document ID:", docId);
      console.log("Setting editing document name:", selectedMenuDocument.document_name);
      console.log("Available document fields:", Object.keys(selectedMenuDocument));
      
      setEditingDocumentId(docId);
      setEditingDocumentName(selectedMenuDocument.document_name || "");
    } else {
      console.log("No document selected!");
    }
    
    handleMenuClose();
  };

  // Handle delete click from menu
  const handleDeleteClick = () => {
    if (selectedMenuDocument) {
      setDocumentToDelete(selectedMenuDocument);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      const userDataString = localStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.user_id || documentToDelete.user_id;

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      const documentTypeUuid = documentToDelete.document_type_uuid || documentToDelete.document_id;

      if (!documentTypeUuid) {
        toast.error("Document ID not found.");
        return;
      }

      await deleteDocument({
        user_id: userId,
        document_type_uuid: documentTypeUuid,
      }).unwrap();

      toast.success("Document deleted successfully");

      // Refresh documents list
      const sessionId = Cookies.get("token");
      if (sessionId) {
        getUserDocuments({
          session_id: sessionId,
        });
      }

      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.");
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  // Save edited document name
  const handleSaveDocumentName = async (doc: DocumentItem) => {
    if (!editingDocumentName.trim()) {
      toast.error("Document name cannot be empty");
      return;
    }

    if (editingDocumentName === doc.document_name) {
      // No change, just cancel editing
      setEditingDocumentId(null);
      return;
    }

    try {
      const userDataString = localStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.user_id || doc.user_id;

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      const documentTypeUuid = doc.document_type_uuid || doc.document_id;

      if (!documentTypeUuid) {
        toast.error("Document ID not found.");
        return;
      }

      await editDocumentName({
        user_id: userId,
        document_type_uuid: documentTypeUuid,
        document_name: editingDocumentName.trim(),
      }).unwrap();

      toast.success("Document name updated successfully");
      
      // Refresh documents list
      const sessionId = Cookies.get("token");
      if (sessionId) {
        getUserDocuments({
          session_id: sessionId,
        });
      }

      setEditingDocumentId(null);
    } catch (error) {
      console.error("Error updating document name:", error);
      toast.error("Failed to update document name. Please try again.");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDocumentId(null);
    setEditingDocumentName("");
  };

  // Close preview and go back to dashboard
  const handleBackToDashboard = () => {
    setShowPreview(false);
    setSelectedDocument(null);
    setLoadingDocumentId(null);
    setShowLoadingOverlay(false);
  };

  // Handle download action
  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      if (!specificDocumentData?.document_base64) {
        toast.error("Document data not available");
        return;
      }

      // Download DOCX
      const binaryString = atob(specificDocumentData.document_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedDocument?.document_name || "document.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    } finally {
      setIsDownloading(false);
    }
  };

  // Toggle See More/See Less
  const handleToggleDocuments = () => {
    setShowAllDocuments(!showAllDocuments);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Show all when searching, reset when cleared
    if (value) {
      setShowAllDocuments(true);
    } else {
      setShowAllDocuments(false);
    }
  };

  // Filter documents based on search query
  const filteredDocuments =
    documentsData?.documents?.filter((doc: DocumentItem) => {
      const searchLower = searchQuery.toLowerCase();
      const documentName = doc.document_name?.toLowerCase() || "";
      return documentName.includes(searchLower);
    }) || [];

  // Calculate documents to display
  const totalDocuments = filteredDocuments.length;
  const shouldShowToggle = totalDocuments > documentsPerRow && !searchQuery;
  const displayedDocuments =
    showAllDocuments || searchQuery
      ? filteredDocuments
      : filteredDocuments.slice(0, documentsPerRow);

  // Default image for documents
  const defaultDocumentImage = "/Folders/documentGenration.png";

  // If showing preview, render only the preview component
  if (showPreview) {
    if (documentPreviewLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#EFF1F5",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (documentPreviewError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#EFF1F5",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography color="error">Failed to load document</Typography>
          <Button variant="contained" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </Box>
      );
    }

    if (specificDocumentData?.document_base64) {
      return (
        <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
          <GenericDocumentPreview
            docxBase64={specificDocumentData.document_base64}
            title={selectedDocument?.document_name || "Document Preview"}
            fileName={selectedDocument?.document_name || "document.docx"}
            onDownload={handleDownload}
            onClose={handleBackToDashboard}
            isDownloading={isDownloading}
            userId={(() => {
              const userDataString = localStorage.getItem("userData");
              const userData = userDataString ? JSON.parse(userDataString) : null;
              return userData?.user_id || selectedDocument?.user_id;
            })()}
            documentTypeUuid={selectedDocument?.document_type_uuid || selectedDocument?.document_id}
            onDocumentNameUpdated={(newName) => {
              // Update the selected document name using proper state update
              if (selectedDocument) {
                setSelectedDocument({
                  ...selectedDocument,
                  document_name: newName,
                });
              }
              // Refresh the documents list
              const sessionId = Cookies.get("token");
              if (sessionId) {
                getUserDocuments({
                  session_id: sessionId,
                });
              }
            }}
          />
        </Box>
      );
    }
  }

  // Regular dashboard view
  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#EFF1F5",
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
              py: 1,
              px: 4,
              width: "100%",
              maxWidth: "1600px",
              mx: "auto",
            }}
          >
            {/* Welcome Section */}
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#000",
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "26px",
                  mb: 1.5,
                }}
              >
                Welcome to{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #FF3C81, #3EA3FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  CAMMI
                </span>
              </Typography>

              {/* Search Bar */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "550px",
                  height: "36px",
                  borderRadius: "18px",
                  border: "0.6px solid #D5D5D5",
                  backgroundColor: "#FFF",
                  px: 2,
                  mx: "auto",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <FaSearch color="#7A7A7A" size={16} />
                <input
                  type="text"
                  placeholder="Search documents"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{
                    marginLeft: "8px",
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                    color: "#000",
                    paddingRight: searchQuery ? "30px" : "0",
                  }}
                />
                {searchQuery && (
                  <Box
                    onClick={() => {
                      setSearchQuery("");
                      setShowAllDocuments(false);
                    }}
                    sx={{
                      position: "absolute",
                      right: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#E0E0E0",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "#BDBDBD",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#FFF",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              justifyContent="flex-start"
              width="100%"
            >
              {/* My Documents */}
              <Box sx={{ width: "100%" }}>
                {/* Header with See More/See Less Toggle */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins",
                      fontSize: "20px",
                      fontWeight: 600,
                    }}
                  >
                    My Documents
                    {searchQuery && (
                      <Typography
                        component="span"
                        sx={{
                          ml: 1,
                          color: "#949494",
                          fontSize: "13px",
                          fontWeight: 400,
                        }}
                      >
                        ({totalDocuments}{" "}
                        {totalDocuments === 1 ? "result" : "results"})
                      </Typography>
                    )}
                  </Typography>

                  {/* See More/See Less Toggle Button */}
                  {shouldShowToggle && !documentsLoading && (
                    <Button
                      onClick={handleToggleDocuments}
                      sx={{
                        backgroundColor: "#FFF",
                        border: "1px solid #D9D9D9",
                        borderRadius: "18px",
                        padding: "4px 8px",
                        color: "#000",
                        fontFamily: "Poppins",
                        fontSize: "10px",
                        fontWeight: 500,
                        textTransform: "none",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "#FFF",
                          borderColor: "#3EA3FF",
                          color: "#3EA3FF",
                        },
                        marginTop: "10px",
                      }}
                    >
                      {showAllDocuments ? "See Less" : "See More"}
                    </Button>
                  )}
                </Box>

                {documentsLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : documentsError ? (
                  <Typography color="error">
                    Error loading documents. Please try again.
                  </Typography>
                ) : displayedDocuments && displayedDocuments.length > 0 ? (
                  <Box 
                    display="flex" 
                    flexWrap="wrap"
                    gap={1.2}
                    sx={{
                      overflowX: "hidden",
                      overflowY: "hidden",
                    }}
                  >
                    {displayedDocuments.map(
                      (doc: DocumentItem, index: number) => {
                        const docId = getDocumentId(doc);
                        const isLoading = loadingDocumentId === docId;
                        const isEditing = editingDocumentId === docId;

                        return (
                          <Box
                            key={docId || index}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              flexShrink: 0,
                              position: "relative",
                            }}
                          >
                            {/* Card */}
                            <Box
                              onClick={() => !isLoading && !isEditing && handleDocumentClick(doc)}
                              sx={{
                                width: "105px",
                                height: "135px",
                                flexShrink: 0,
                                borderRadius: "12px",
                                backgroundColor: "#E4E5E8",
                                border: "1px solid #E4E5E8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                position: "relative",
                                cursor: isLoading || isEditing ? "default" : "pointer",
                                opacity: isLoading ? 0.7 : 1,
                                transition: "all 0.2s",
                                userSelect: "none",
                                "&:hover": {
                                  transform: isLoading || isEditing
                                    ? "none"
                                    : "translateY(-4px)",
                                  backgroundColor: isLoading || isEditing
                                    ? "#E4E5E8"
                                    : "#D5D7DB",
                                  borderColor: isLoading || isEditing
                                    ? "#E4E5E8"
                                    : "#C5C7CB",
                                },
                              }}
                            >
                              <img
                                src={defaultDocumentImage}
                                alt={doc.document_name || "Document"}
                                style={{
                                  width: "80%",
                                  height: "80%",
                                  objectFit: "contain",
                                  pointerEvents: "none",
                                }}
                              />

                              {/* Three-dot menu button */}
                              {!isLoading && !isEditing && (
                                <IconButton
                                  onClick={(e) => handleMenuClick(e, doc)}
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    padding: "4px",
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    "&:hover": {
                                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    },
                                  }}
                                >
                                  <BsThreeDotsVertical size={14} color="#666" />
                                </IconButton>
                              )}

                              {/* Loading Overlay */}
                              {isLoading && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "15px",
                                  }}
                                >
                                  <CircularProgress
                                    size={35}
                                    sx={{
                                      color: "#3EA3FF",
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Document Name and Date */}
                            <Box
                              sx={{
                                mt: 0.8,
                                textAlign: "center",
                                width: "105px",
                              }}
                            >
                              {isEditing ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editingDocumentName}
                                    onChange={(e) => setEditingDocumentName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleSaveDocumentName(doc);
                                      } else if (e.key === "Escape") {
                                        handleCancelEdit();
                                      }
                                    }}
                                    autoFocus
                                    disabled={isEditingName}
                                    style={{
                                      width: "100%",
                                      height: "24px",
                                      fontSize: "9px",
                                      fontFamily: "Poppins",
                                      padding: "4px 6px",
                                      border: "1px solid #3EA3FF",
                                      borderRadius: "4px",
                                      outline: "none",
                                      backgroundColor: isEditingName ? "#f5f5f5" : "#fff",
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 0.5,
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Button
                                      onClick={() => handleSaveDocumentName(doc)}
                                      disabled={isEditingName}
                                      sx={{
                                        minWidth: "40px",
                                        height: "18px",
                                        padding: "2px 6px",
                                        fontSize: "8px",
                                        fontFamily: "Poppins",
                                        textTransform: "none",
                                        backgroundColor: "#3EA3FF",
                                        color: "#FFF",
                                        "&:hover": {
                                          backgroundColor: "#2E8FD9",
                                        },
                                        "&:disabled": {
                                          backgroundColor: "#B0B0B0",
                                          color: "#FFF",
                                        },
                                      }}
                                    >
                                      {isEditingName ? (
                                        <CircularProgress size={10} sx={{ color: "#FFF" }} />
                                      ) : (
                                        "Save"
                                      )}
                                    </Button>
                                    <Button
                                      onClick={handleCancelEdit}
                                      disabled={isEditingName}
                                      sx={{
                                        minWidth: "40px",
                                        height: "18px",
                                        padding: "2px 6px",
                                        fontSize: "8px",
                                        fontFamily: "Poppins",
                                        textTransform: "none",
                                        backgroundColor: "#E0E0E0",
                                        color: "#000",
                                        "&:hover": {
                                          backgroundColor: "#D0D0D0",
                                        },
                                        "&:disabled": {
                                          backgroundColor: "#F0F0F0",
                                          color: "#B0B0B0",
                                        },
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </Box>
                                </Box>
                              ) : (
                                <>
                                  <Typography
                                    sx={{
                                      color: "#000000",
                                      fontFamily: "Poppins",
                                      fontSize: "9px",
                                      fontStyle: "normal",
                                      fontWeight: 500,
                                      lineHeight: "12px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      px: 0.5,
                                    }}
                                    title={doc.document_name || "Unnamed Document"}
                                  >
                                    {doc.document_name || "Unnamed Document"}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#949494",
                                      fontFamily: "Poppins",
                                      fontSize: "7px",
                                      fontStyle: "normal",
                                      fontWeight: 400,
                                      lineHeight: "10px",
                                      mt: 0.3,
                                    }}
                                  >
                                    {doc.createdAt ?? doc.created_at
                                      ? new Date(
                                          (doc.createdAt ??
                                            doc.created_at) as string
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                      : "No date"}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        );
                      }
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      backgroundColor: "#FFF",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#949494",
                        fontFamily: "Poppins",
                        fontSize: "14px",
                      }}
                    >
                      {searchQuery
                        ? `No documents found matching "${searchQuery}"`
                        : "No documents found. Start by creating your first document!"}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* CAMMI Expert Review Table */}
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#000",
                    fontFamily: "Poppins",
                    fontSize: "20px",
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  CAMMI Expert Review
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: "12px",
                    width: "100%",
                    boxShadow: "none",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        {[
                          "No",
                          "Name",
                          "Organization",
                          "Date",
                          "Project",
                          "Status",
                        ].map((header) => (
                          <TableCell key={header} sx={{ fontWeight: 600 }}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Error loading data
                          </TableCell>
                        </TableRow>
                      ) : data && data.length > 0 ? (
                        data.map((review: Review, index: number) => (
                          <TableRow key={review.id ?? index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{review.DocumentName}</TableCell>
                            <TableCell>{review.Organization}</TableCell>
                            <TableCell>{review.Date}</TableCell>
                            <TableCell>{review.Project}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                sx={{
                                  width: "90px",
                                  height: "27px",
                                  flexShrink: 0,
                                  borderRadius: "4.5px",
                                  backgroundColor:
                                    review.Status === "Completed"
                                      ? "rgba(0, 182, 155, 0.2)"
                                      : "rgba(255, 193, 7, 0.2)",
                                  color:
                                    review.Status === "Completed"
                                      ? "#00B69B"
                                      : "#FFC107",
                                  fontFamily: "'Nunito Sans', sans-serif",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  lineHeight: "normal",
                                  textTransform: "none",
                                  minWidth: 0,
                                  padding: 0,
                                  boxShadow: "none",
                                  "&:hover": {
                                    backgroundColor:
                                      review.Status === "Completed"
                                        ? "rgba(0, 182, 155, 0.2)"
                                        : "rgba(255, 193, 7, 0.2)",
                                    color:
                                      review.Status === "Completed"
                                        ? "#00B69B"
                                        : "#FFC107",
                                    boxShadow: "none",
                                  },
                                }}
                              >
                                {review.Status}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Three-dot Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            minWidth: "140px",
          },
        }}
      >
        <MenuItem
          onClick={handleRenameClick}
          sx={{
            fontFamily: "Poppins",
            fontSize: "13px",
            py: 1,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&:hover": {
              backgroundColor: "rgba(62, 163, 255, 0.1)",
            },
          }}
        >
          <MdDriveFileRenameOutline size={16} color="#3EA3FF" />
          Rename
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            fontFamily: "Poppins",
            fontSize: "13px",
            py: 1,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 60, 129, 0.1)",
            },
          }}
        >
          <MdDelete size={16} color="#FF3C81" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px",
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: "Poppins", fontWeight: 600 }}>
          Delete Document
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: "Poppins", fontSize: "14px" }}>
            Are you sure you want to delete "{documentToDelete?.document_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button
            onClick={handleCancelDelete}
            disabled={isDeletingDocument}
            sx={{
              fontFamily: "Poppins",
              textTransform: "none",
              color: "#666",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeletingDocument}
            variant="contained"
            sx={{
              fontFamily: "Poppins",
              textTransform: "none",
              backgroundColor: "#FF3C81",
              "&:hover": {
                backgroundColor: "#E03570",
              },
              "&:disabled": {
                backgroundColor: "#FFB3C9",
              },
            }}
          >
            {isDeletingDocument ? (
              <CircularProgress size={20} sx={{ color: "#FFF" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full-Screen Loading Overlay */}
      {showLoadingOverlay && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-in",
            "@keyframes fadeIn": {
              from: {
                opacity: 0,
              },
              to: {
                opacity: 1,
              },
            },
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: "#3EA3FF",
              mb: 2,
            }}
          />
          <Typography
            sx={{
              color: "#FFF",
              fontFamily: "Poppins",
              fontSize: "18px",
              fontWeight: 500,
              mt: 2,
            }}
          >
            Loading document...
          </Typography>
        </Box>
      )}
    </>
  );
};

export default DashboardPage;