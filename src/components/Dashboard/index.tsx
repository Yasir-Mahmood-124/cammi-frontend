"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  Box,
  Container,
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
} from "@mui/material";
import { FaSearch } from "react-icons/fa";
import {
  useGetReviewsMutation,
  Review,
} from "@/redux/services/documentReview/reviewApi";
import { useGetUserDocumentsMutation } from "@/redux/services/document/documentsApi";
import { useGetSpecificDocumentMutation } from "@/redux/services/document/getSpecificDocument";
import Cookies from "js-cookie";
import GenericDocumentPreview from "@/components/GenericDocumentPreview";
import toast from "react-hot-toast";

interface DocumentItem {
  document_id?: string;
  document_type_uuid?: string;
  document_name?: string;
  createdAt?: string;
  created_at?: string;
  user_id?: string;
}

const DashboardPage = () => {
  const [getReviews, { data, isLoading, error }] = useGetReviewsMutation();
  const [
    getUserDocuments,
    {
      data: documentsData,
      isLoading: documentsLoading,
      error: documentsError,
    },
  ] = useGetUserDocumentsMutation();

  const [
    getSpecificDocument,
    {
      data: specificDocumentData,
      isLoading: documentPreviewLoading,
      error: documentPreviewError,
    },
  ] = useGetSpecificDocumentMutation();

  // State for document preview
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  
  // State for See More/See Less functionality
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [documentsPerRow] = useState(7); // Approximate number of documents per row with smaller cards
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");

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

  // Handle document card click
  const handleDocumentClick = async (doc: DocumentItem) => {
    // Show loading overlay immediately
    setShowLoadingOverlay(true);
    
    try {
      // Set loading state for this specific document
      setLoadingDocumentId(doc.document_id || null);
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
  const filteredDocuments = documentsData?.documents?.filter((doc: DocumentItem) => {
    const searchLower = searchQuery.toLowerCase();
    const documentName = doc.document_name?.toLowerCase() || "";
    return documentName.includes(searchLower);
  }) || [];

  // Calculate documents to display
  const totalDocuments = filteredDocuments.length;
  const shouldShowToggle = totalDocuments > documentsPerRow && !searchQuery; // Hide toggle when searching
  const displayedDocuments = showAllDocuments || searchQuery
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
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 1,
          }}
        >
          {/* Welcome Section */}
          <Box sx={{ textAlign: "center" }}>
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
              Welcome to CAMMI
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
                      ({totalDocuments} {totalDocuments === 1 ? 'result' : 'results'})
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
                <Box display="flex" flexWrap="wrap" gap={1.2}>
                  {displayedDocuments.map((doc: DocumentItem, index: number) => {
                    const isLoading = loadingDocumentId === doc.document_id;
                    
                    return (
                    <Box
                      key={doc.document_id || index}
                      onClick={() => !isLoading && handleDocumentClick(doc)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: isLoading ? "wait" : "pointer",
                        transition: "transform 0.2s",
                        opacity: isLoading ? 0.7 : 1,
                        "&:hover": {
                          transform: isLoading ? "none" : "translateY(-4px)",
                        },
                      }}
                    >
                      {/* Card */}
                      <Box
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
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: isLoading ? "#E4E5E8" : "#D5D7DB",
                            borderColor: isLoading ? "#E4E5E8" : "#C5C7CB",
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
                          }}
                        />
                        
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
                      <Box sx={{ mt: 0.8, textAlign: "center", width: "105px" }}>
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
                          {(doc.createdAt ?? doc.created_at)
                            ? new Date(
                                (doc.createdAt ?? doc.created_at) as string
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No date"}
                        </Typography>
                      </Box>
                    </Box>
                  )})}
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
                      : "No documents found. Start by creating your first document!"
                    }
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
                  maxWidth: 900,
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
        </Container>
      </Box>
    </Box>

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