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
} from "@mui/material";
import { FaSearch } from "react-icons/fa";
import {
  useGetReviewsMutation,
  Review,
} from "@/redux/services/documentReview/reviewApi";
interface Document {
  id: number;
  name: string;
  imageUrl: string;
}

interface Project {
  id: number;
  title: string;
}

const DashboardPage = () => {
  const [getReviews, { data, isLoading, error }] = useGetReviewsMutation();

  useEffect(() => {
    getReviews();
  }, []);
  // Static array data
  const documents: Document[] = [
    {
      id: 1,
      name: "Business Plan",
      imageUrl: "/Folders/documentGenration.png",
    },
    { id: 2, name: "GTM Strategy", imageUrl: "/Folders/documentGenration.png" },
    { id: 3, name: "AI Proposal", imageUrl: "/Folders/documentGenration.png" },
  ];

  const projects: Project[] = [
    { id: 1, title: "Krados" },
    { id: 2, title: "NovaEdge" },
    { id: 3, title: "Cortex AI" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        gap: "100px",
      }}
    >
      {/* Sidebar */}
      <Box sx={{ width: 150, flexShrink: 0 }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#EFF1F5",
          overflowY: "auto",
          py: 4,
          pl: 8,
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
              <Box display="flex" flexWrap="wrap" gap={2}>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
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
                        }}
                      >
                        <img
                          src={doc.imageUrl} // replace with demo image if needed
                          alt={doc.name}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>

                      {/* Document Name */}
                      <Box display={"flex"}>
                        <Box>
                          <Typography
                            sx={{
                              color: "#000000",
                              fontFamily: "Poppins",
                              fontSize: "10px",
                              fontStyle: "normal",
                              fontWeight: 400,
                              lineHeight: "14px",
                              mt: 1, // spacing between card and text
                              textAlign: "center",
                            }}
                          >
                            {doc.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#949494",
                              fontFamily: "Poppins",
                              fontSize: "8px",
                              fontStyle: "normal",
                              fontWeight: 400,
                              lineHeight: "11.2px",
                              textAlign: "center",
                            }}
                          >
                            {doc.name}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: "17.131px",
                            height: "18.272px",
                            flexShrink: 0, // prevents shrinking
                            display: "flex", // ensures img can align properly if needed
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        ></Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography>No documents found.</Typography>
                )}
              </Box>
            </Box>

            {/* Recent Projects */}
            <Box
              display="flex"
              flexWrap="wrap"
              flexDirection={"column"}
              gap={2}
              justifyContent="flex-start"
            >
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
                Recent Projects
              </Typography>

              <Box
                display="flex"
                // flexDirection="column"
                alignItems="center"
                gap={1.5}
              >
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <Button
                      key={project.id}
                      variant="contained"
                      sx={{
                        width: "250px",
                        height: "50px",
                        flexShrink: 0,
                        borderRadius: "5px",
                        border: "1px solid #D9D9D9",
                        backgroundColor: "#FFF",
                        color: "#000",
                        textTransform: "none",
                        boxShadow: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 1, // spacing between icon and text
                        px: 2,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      {/* Folder Icon */}
                      <img
                        src="/Folders/folder.png"
                        alt="Folder"
                        style={{
                          width: "37px",
                          height: "37px",
                          objectFit: "contain",
                        }}
                      />

                      {/* Project Title */}
                      <span>{project.title}</span>

                      {/* Three-dot SVG aligned to the right */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="4"
                        height="16"
                        viewBox="0 0 4 16"
                        fill="none"
                        style={{ marginLeft: "auto", flexShrink: 0 }}
                      >
                        <path
                          d="M4 2C4 3.10457 3.10457 4 2 4C0.89543 4 0 3.10457 0 2C0 0.89543 0.89543 0 2 0C3.10457 0 4 0.89543 4 2Z"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M4 8C4 9.10457 3.10457 10 2 10C0.89543 10 0 9.10457 0 8C0 6.89543 0.89543 6 2 6C3.10457 6 4 6.89543 4 8Z"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M4 14C4 15.1046 3.10457 16 2 16C0.89543 16 0 15.1046 0 14C0 12.8954 0.89543 12 2 12C3.10457 12 4 12.8954 4 14Z"
                          fill="#D9D9D9"
                        />
                      </svg>
                    </Button>
                  ))
                ) : (
                  <Typography>No projects available.</Typography>
                )}
              </Box>
            </Box>

            {/* Expert Review Table */}
            {/* <Box sx={{ width: "100%" }}>
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
                sx={{
                  borderRadius: "12px",
                  maxWidth: 900,
                  // mx: "auto",
                }}
              >
                <Table>
                  <TableHead
                    sx={
                      {
                        // backgroundColor: "#EFF1F5",
                      }
                    }
                  >
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
                    <TableRow>
                      <TableCell>01</TableCell>
                      <TableCell>GTM Document</TableCell>
                      <TableCell>Kartech</TableCell>
                      <TableCell>04 Sep 2025</TableCell>
                      <TableCell>Krados</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          sx={{
                            width: "90px",
                            height: "27px",
                            flexShrink: 0,
                            borderRadius: "4.5px",
                            backgroundColor: "rgba(0, 182, 155, 0.2)", // semi-transparent background
                            color: "#00B69B", // text color
                            fontFamily: "'Nunito Sans', sans-serif",
                            fontSize: "12px",
                            fontStyle: "normal",
                            fontWeight: 700,
                            lineHeight: "normal",
                            textTransform: "none",
                            minWidth: "0",
                            padding: 0,
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor: "rgba(0, 182, 155, 0.2)", // same as normal
                              color: "#00B69B", // same text color
                              boxShadow: "none", // no shadow
                            },
                          }}
                        >
                          Completed
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box> */}
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
                        <TableRow key={review.id}>
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
