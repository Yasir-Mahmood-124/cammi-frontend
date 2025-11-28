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

import { FaSearch } from "@/assests/icons";
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
import styles from "./style.module.scss";

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
        <Box className={styles.previewLoadingContainer}>
          <CircularProgress />
        </Box>
      );
    }

    if (documentPreviewError) {
      return (
        <Box className={styles.previewErrorContainer}>
          <Typography color="error">Failed to load document</Typography>
          <Button variant="contained" onClick={handleBackToDashboard}>
            Back to Dashboard
          </Button>
        </Box>
      );
    }

    if (specificDocumentData?.document_base64) {
      return (
        <Box className={styles.previewWrapper}>
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
      <Box className={styles.dashboardContainer}>
        {/* Main Content */}
        <Box className={styles.mainContent}>
          <Box className={styles.contentWrapper}>
            {/* Welcome Section */}
            <Box className={styles.welcomeSection}>
              <Typography className={styles.welcomeTitle}>
                Welcome to{" "}
                <span className={styles.brandName}>
                  CAMMI
                </span>
              </Typography>

              {/* Search Bar */}
              <Box className={styles.searchBarContainer}>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search documents"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`${styles.searchInput} ${searchQuery ? styles.withClearButton : ''}`}
                />
                {searchQuery && (
                  <Box
                    onClick={() => {
                      setSearchQuery("");
                      setShowAllDocuments(false);
                    }}
                    className={styles.clearButton}
                  >
                    <Typography className={styles.clearButtonText}>
                      ×
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box className={styles.documentsWrapper}>
              {/* My Documents */}
              <Box className={styles.documentsSection}>
                {/* Header with See More/See Less Toggle */}
                <Box className={styles.sectionHeader}>
                  <Typography className={styles.sectionTitle}>
                    My Documents
                    {searchQuery && (
                      <Typography component="span" className={styles.searchResultsCount}>
                        ({totalDocuments}{" "}
                        {totalDocuments === 1 ? "result" : "results"})
                      </Typography>
                    )}
                  </Typography>

                  {/* See More/See Less Toggle Button */}
                  {shouldShowToggle && !documentsLoading && (
                    <Button
                      onClick={handleToggleDocuments}
                      className={styles.toggleButton}
                    >
                      {showAllDocuments ? "See Less" : "See all"}
                    </Button>
                  )}
                </Box>

                {documentsLoading ? (
                  <Box className={styles.loadingContainer}>
                    <CircularProgress />
                  </Box>
                ) : documentsError ? (
                  <Typography className={styles.errorText}>
                    Error loading documents. Please try again.
                  </Typography>
                ) : displayedDocuments && displayedDocuments.length > 0 ? (
                  <Box className={styles.documentCardsContainer}>
                    {displayedDocuments.map(
                      (doc: DocumentItem, index: number) => {
                        const docId = getDocumentId(doc);
                        const isLoading = loadingDocumentId === docId;
                        const isEditing = editingDocumentId === docId;

                        return (
                          <Box
                            key={docId || index}
                            className={styles.documentCardWrapper}
                          >
                            {/* Card */}
                            <Box
                              onClick={() => !isLoading && !isEditing && handleDocumentClick(doc)}
                              className={`${styles.documentCard} ${isLoading ? styles.loading : ''} ${isEditing ? styles.editing : ''}`}
                            >
                              <img
                                src={defaultDocumentImage}
                                alt={doc.document_name || "Document"}
                                className={styles.documentImage}
                              />

                              {/* Three-dot menu button */}
                              {!isLoading && !isEditing && (
                                <IconButton
                                  onClick={(e) => handleMenuClick(e, doc)}
                                  className={styles.menuButton}
                                >
                                  <BsThreeDotsVertical size={14} color="#666" />
                                </IconButton>
                              )}

                              {/* Loading Overlay */}
                              {isLoading && (
                                <Box className={styles.loadingOverlay}>
                                  <CircularProgress
                                    size={35}
                                    sx={{ color: "#3EA3FF" }}
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Document Name and Date */}
                            <Box className={styles.documentInfo}>
                              {isEditing ? (
                                <Box
                                  className={styles.editingContainer}
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
                                    className={styles.editInput}
                                  />
                                  <Box className={styles.editButtonsContainer}>
                                    <Button
                                      onClick={() => handleSaveDocumentName(doc)}
                                      disabled={isEditingName}
                                      className={styles.saveButton}
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
                                      className={styles.cancelButton}
                                    >
                                      Cancel
                                    </Button>
                                  </Box>
                                </Box>
                              ) : (
                                <>
                                  <Typography
                                    className={styles.documentName}
                                    title={doc.document_name || "Unnamed Document"}
                                  >
                                    {doc.document_name || "Unnamed Document"}
                                  </Typography>
                                  <Typography className={styles.documentDate}>
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
                  <Box className={styles.emptyState}>
                    <Typography className={styles.emptyStateText}>
                      {searchQuery
                        ? `No documents found matching "${searchQuery}"`
                        : "No documents found. Start by creating your first document!"}
                    </Typography>
                  </Box>
                )}
              </Box>

                {/* CAMMI Expert Review Table */}
                <Box className={styles.documentsSection}>
                  <Typography className={styles.sectionTitle}>
                    CAMMI Expert Review
                  </Typography>

                  <TableContainer
                    component={Paper}
                    elevation={0}
                    className={styles.tableContainer}
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
                            <TableCell key={header} className={styles.tableHeader}>
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
                                  className={`${styles.statusButton} ${
                                    review.Status === "Completed"
                                      ? styles.completed
                                      : styles.pending
                                  }`}
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
        slotProps={{
          paper: {
            className: styles.menuPaper,
          },
        }}
      >
        <MenuItem
          onClick={handleRenameClick}
          className={`${styles.menuItem} ${styles.rename}`}
        >
          <MdDriveFileRenameOutline size={16} color="#3EA3FF" />
          Rename
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          className={`${styles.menuItem} ${styles.delete}`}
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
          className: styles.dialogPaper,
        }}
      >
        <DialogTitle className={styles.dialogTitle}>
          Delete Document
        </DialogTitle>
        <DialogContent>
          <DialogContentText className={styles.dialogContent}>
            Are you sure you want to delete "{documentToDelete?.document_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={handleCancelDelete}
            disabled={isDeletingDocument}
            className={styles.dialogCancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeletingDocument}
            variant="contained"
            className={styles.dialogDeleteButton}
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
        <Box className={styles.fullScreenOverlay}>
          <CircularProgress
            size={60}
            thickness={4}
            className={styles.overlaySpinner}
          />
          <Typography className={styles.overlayText}>
            Loading document...
          </Typography>
        </Box>
      )}
    </>
  );
};

export default DashboardPage;