"use client";

import React, { useEffect } from "react";
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
import Cookies from "js-cookie";

interface Project {
  id: number;
  title: string;
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

  // Log the API response to check structure
  // useEffect(() => {
  //   if (documentsData) {
  //     console.log("Documents API Response:", documentsData);
  //   }
  // }, [documentsData]);

  // Default image for documents
  const defaultDocumentImage = "/Folders/documentGenration.png";

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        // height: "100vh",
        overflow: "hidden",
        gap: "100px",
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#EFF1F5",
          overflowY: "auto",
          py: 2,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
            gap: 7,
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
                fontSize: "32px",
                mb: 3,
              }}
            >
              Welcome to CAMMI
            </Typography>

            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "600px",
                height: "40px",
                borderRadius: "19px",
                border: "0.6px solid #D5D5D5",
                backgroundColor: "#FFF",
                px: 2,
                mx: "auto",
                flexShrink: 0,
              }}
            >
              <FaSearch color="#7A7A7A" size={18} />
              <input
                type="text"
                placeholder="Search documents"
                style={{
                  marginLeft: "8px",
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "16px",
                  fontFamily: "Poppins, sans-serif",
                  color: "#000",
                }}
              />
            </Box>
          </Box>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={5}
            justifyContent="flex-start"
          >
            {/* My Documents */}
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#000",
                  fontFamily: "Poppins",
                  fontSize: "24px",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                My Documents
              </Typography>

              {documentsLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : documentsError ? (
                <Typography color="error">
                  Error loading documents. Please try again.
                </Typography>
              ) : documentsData?.documents &&
                documentsData.documents.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {documentsData.documents.map((doc, index) => (
                    <Box
                      key={(doc as any).document_id || index}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      {/* Card */}
                      <Box
                        sx={{
                          width: "130px",
                          height: "160px",
                          flexShrink: 0,
                          borderRadius: "15px",
                          backgroundColor: "#E4E5E8",
                          border: "1px solid #E4E5E8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: "#D5D7DB",
                            borderColor: "#C5C7CB",
                          },
                        }}
                      >
                        <img
                          src={defaultDocumentImage}
                          alt={(doc as any).document_name || "Document"}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>

                      {/* Document Name and Date */}
                      <Box sx={{ mt: 1, textAlign: "center", width: "130px" }}>
                        <Typography
                          sx={{
                            color: "#000000",
                            fontFamily: "Poppins",
                            fontSize: "10px",
                            fontStyle: "normal",
                            fontWeight: 500,
                            lineHeight: "14px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            px: 0.5,
                          }}
                          title={(doc as any).document_name || "Unnamed Document"}
                        >
                          {(doc as any).document_name || "Unnamed Document"}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#949494",
                            fontFamily: "Poppins",
                            fontSize: "8px",
                            fontStyle: "normal",
                            fontWeight: 400,
                            lineHeight: "11.2px",
                            mt: 0.5,
                          }}
                        >
                          {((doc as any).createdAt ?? (doc as any).created_at)
                            ? new Date(
                                (doc as any).createdAt ?? (doc as any).created_at
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No date"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
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
                    No documents found. Start by creating your first document!
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
                  fontSize: "24px",
                  fontWeight: 600,
                  mb: 5,
                }}
              >
                CAMMI Expert Review
              </Typography>

              <TableContainer
                component={Paper}
                sx={{ borderRadius: "12px", maxWidth: 900 }}
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
  );
};

export default DashboardPage;