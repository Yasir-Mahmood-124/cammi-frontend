"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  ListItemIcon,
  Modal,
  Collapse,
} from "@mui/material";
import Image from "next/image";
import Logo from "../../assests/images/Logo.png";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

// --------- ICON IMPORTS ----------
import {
  BS,
  Dashboard,
  GTM,
  ICP,
  KMF,
  LeadCalculator,
  Scheduler,
  SR,
} from "@/assests/icons";
import CreateProject from "./CreateProject";
import DocumentGenerationModal from "./DocumentGenerationModal";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface CurrentProject {
  organization_id: string;
  organization_name: string;
  project_id: string;
  project_name: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [selected, setSelected] = useState<string>("Dashboard");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [openDocument, setOpenDocument] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const staticDocs = [
    "GTM Document",
    "ICP Document",
    "Strategy Roadmap",
    "Messaging Framework",
    "Brand Identity",
  ];

  // Map document labels to routes
  const documentRoutes: Record<string, string> = {
    "GTM Document": "/dashboard/gtm",
    "ICP Document": "/dashboard/icp",
    "Strategy Roadmap": "/dashboard/strategy-roadmap",
    "Messaging Framework": "/dashboard/messaging-framework",
    "Brand Identity": "/dashboard/brand-identity",
    "Quarterly marketing plan": "/dashboard/quarterly-marketing-plan",
    "Content calendar template": "/dashboard/content-calendar-template",
  };

  // Map tool labels to routes
  const toolRoutes: Record<string, string> = {
    "Lead Calculator": "/dashboard/lead-calculator",
    "Scheduler": "/dashboard/scheduler",
    "LinkedIn": "/dashboard/scheduler/linkedin",
    "Calendar": "/dashboard/scheduler/calendar",
  };

  // Check if project exists in localStorage
  const checkProjectExists = (): boolean => {
    const currentProject = localStorage.getItem("currentProject");
    if (!currentProject) {
      return false;
    }
    
    try {
      const projectData = JSON.parse(currentProject);
      return !!(projectData.organization_id && projectData.project_id);
    } catch (error) {
      return false;
    }
  };

  // Load current project from localStorage
  const loadCurrentProject = () => {
    const storedProject = localStorage.getItem("currentProject");
    if (storedProject) {
      try {
        setCurrentProject(JSON.parse(storedProject));
      } catch (error) {
        console.error("Error parsing project data:", error);
        setCurrentProject(null);
      }
    } else {
      setCurrentProject(null);
    }
  };

  // Get organization initials
  const getOrganizationInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Update selected based on current pathname
  useEffect(() => {
    if (pathname === "/dashboard") {
      setSelected("Dashboard");
    } else {
      // Find which document matches the current path
      const matchedDoc = Object.entries(documentRoutes).find(
        ([_, route]) => pathname === route
      );
      if (matchedDoc) {
        setSelected(matchedDoc[0]);
        return;
      }
      
      // Find which tool matches the current path
      const matchedTool = Object.entries(toolRoutes).find(
        ([_, route]) => pathname === route
      );
      if (matchedTool) {
        setSelected(matchedTool[0]);
        // Auto-open scheduler dropdown if LinkedIn or Calendar is selected
        if (matchedTool[0] === "LinkedIn" || matchedTool[0] === "Calendar") {
          setSchedulerOpen(true);
        }
      }
    }
  }, [pathname]);

  // Load saved docs from localStorage
  useEffect(() => {
    const storedDocs = localStorage.getItem("sidebarDocs");
    if (storedDocs) {
      setSelectedDocs(JSON.parse(storedDocs));
    }
  }, []);

  // Load current project on mount
  useEffect(() => {
    loadCurrentProject();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadCurrentProject();
    };

    // Custom event listener for same-tab updates
    const handleProjectUpdate = () => {
      loadCurrentProject();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("projectUpdated", handleProjectUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("projectUpdated", handleProjectUpdate);
    };
  }, []);

  // Save docs to localStorage whenever selectedDocs changes
  useEffect(() => {
    localStorage.setItem("sidebarDocs", JSON.stringify(selectedDocs));
  }, [selectedDocs]);

  const menuItems = [{ label: "Dashboard", icon: <Dashboard /> }];
  const documentItems = [
    { label: "GTM Document", icon: <GTM /> },
    { label: "ICP Document", icon: <ICP /> },
    { label: "Strategy Roadmap", icon: <SR /> },
    { label: "Messaging Framework", icon: <KMF /> },
    { label: "Brand Identity", icon: <BS /> },
  ];
  const toolItems = [
    { label: "Lead Calculator", icon: <LeadCalculator /> },
    { label: "Scheduler", icon: <Scheduler /> },
  ];

  const getIconFilter = (label: string, isSelected: boolean) => {
    const reverseIcons = ["Dashboard"];
    const isReversed = reverseIcons.includes(label);
    if (isReversed) {
      return isSelected ? "invert(0)" : "invert(1) brightness(2)";
    } else {
      return isSelected ? "invert(1) brightness(2)" : "invert(0)";
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Reload project data when modal closes
    loadCurrentProject();
  };
  const handleOpenDocument = () => setOpenDocument(true);
  const handleCloseDocument = () => setOpenDocument(false);

  // Handle navigation for menu items
  const handleMenuItemClick = (label: string) => {
    setSelected(label);
    if (label === "Dashboard") {
      router.push("/dashboard");
    }
  };

  // Handle navigation for document items with validation
  const handleDocumentClick = (label: string) => {
    if (!checkProjectExists()) {
      toast.error("Please create or select a project first");
      setOpen(true);
      return;
    }

    setSelected(label);
    const route = documentRoutes[label];
    if (route) {
      router.push(route);
    }
  };

  // Handle navigation for tool items
  const handleToolClick = (label: string) => {
    setSelected(label);
    const route = toolRoutes[label];
    if (route) {
      router.push(route);
    }
  };

  // Common button styles with left indicator
  const getButtonStyles = (isSelected: boolean) => ({
    borderRadius: "8px",
    pl: "8px",
    color: isSelected ? "#FFF" : "#000",
    backgroundColor: isSelected ? "#3EA3FF" : "transparent",
    position: "relative",
    justifyContent: isCollapsed ? "center" : "flex-start",
    mb: 0.5,
    "&:hover": {
      backgroundColor: isSelected ? "#3EA3FF" : "rgba(62,163,255,0.1)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      left: "-16px",
      top: 0,
      height: "100%",
      width: isSelected ? "4px" : "0px",
      backgroundColor: "#3EA3FF",
      borderRadius: "0 4px 4px 0",
      transition: "width 0.2s ease",
    },
  });

  return (
    <Box
      sx={{
        width: isCollapsed ? "70px" : "270px",
        backgroundColor: "#FFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #E0E0E0",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Top Section */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "space-between"}
          gap={1.5}
          mb={2}
        >
          {!isCollapsed && (
            <Image
              src={Logo}
              alt="Logo"
              width={60}
              height={45}
              style={{ aspectRatio: "4/3" }}
            />
          )}
          <IconButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            sx={{
              color: "#3EA3FF",
              "&:hover": { backgroundColor: "rgba(62,163,255,0.1)" },
            }}
          >
            {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Middle Section */}
      <Box sx={{ flexGrow: 1, px: 2, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Main Menu */}
        <List sx={{ flexShrink: 0 }}>
          {menuItems.map((item) => {
            const isSelected = selected === item.label;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => handleMenuItemClick(item.label)}
                sx={getButtonStyles(isSelected)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? "unset" : "32px",
                    justifyContent: "center",
                    "& svg": {
                      width: 20,
                      height: 20,
                      transition: "filter 0.2s ease",
                      filter: getIconFilter(item.label, isSelected),
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "14px",
                      letterSpacing: "0.3px",
                      color: isSelected ? "#FFF" : "#000",
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {!isCollapsed && (
          <>
            <Divider sx={{ my: 1, mx: "-16px", borderColor: "#E0E0E0", flexShrink: 0 }} />

            {/* Document Generation */}
            <Box sx={{ flexShrink: 0 }}>
              {/* Fixed Header */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1, backgroundColor: "#FFF", zIndex: 1 }}
              >
                <Typography
                  sx={{
                    color: "#202224",
                    opacity: 0.6,
                    fontSize: "12px",
                    letterSpacing: "0.257px",
                  }}
                >
                  Document Generation
                </Typography>
                <IconButton
                  size="small"
                  sx={{ color: "#202224", opacity: 0.6 }}
                  onClick={handleOpenDocument}
                >
                  <AddIcon sx={{ fontSize: "16px" }} />
                </IconButton>
              </Box>

              <DocumentGenerationModal
                open={openDocument}
                onClose={handleCloseDocument}
                selected={selectedDocs}
                setSelected={setSelectedDocs}
              />

              {/* Scrollable Document List */}
              <Box
                sx={{
                  maxHeight: "180px",
                  overflowY: "auto",
                  mb: 1,
                  pr: "8px",
                  mr: "-16px",
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#3EA3FF",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                }}
              >
                <List sx={{ py: 0 }}>
                  {/* Static documents always visible */}
                  {staticDocs.map((label) => {
                    const icon = documentItems.find((doc) => doc.label === label)
                      ?.icon || <GTM />;
                    const isSelected = selected === label;
                    return (
                      <ListItemButton
                        key={label}
                        onClick={() => handleDocumentClick(label)}
                        sx={getButtonStyles(isSelected)}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: "32px",
                            "& svg": {
                              width: 20,
                              height: 20,
                              filter: getIconFilter(label, isSelected),
                            },
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={label}
                          primaryTypographyProps={{
                            fontSize: "14px",
                            color: isSelected ? "#FFF" : "#000",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}

                  {/* Dynamic documents */}
                  {selectedDocs.map((label) => {
                    const icon = documentItems.find((doc) => doc.label === label)
                      ?.icon || <GTM />;
                    const isSelected = selected === label;
                    return (
                      <ListItemButton
                        key={label}
                        onClick={() => handleDocumentClick(label)}
                        sx={getButtonStyles(isSelected)}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: "32px",
                            "& svg": {
                              width: 20,
                              height: 20,
                              filter: getIconFilter(label, isSelected),
                            },
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={label}
                          primaryTypographyProps={{
                            fontSize: "14px",
                            color: isSelected ? "#FFF" : "#000",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            </Box>

            <Divider sx={{ my: 1, mx: "-16px", borderColor: "#E0E0E0", flexShrink: 0 }} />

            {/* Tools */}
            <Box sx={{ flexShrink: 0 }}>
              {/* Fixed Header */}
              <Typography
                sx={{
                  color: "#202224",
                  opacity: 0.6,
                  fontSize: "12px",
                  letterSpacing: "0.257px",
                  mb: 1,
                  backgroundColor: "#FFF",
                  zIndex: 1,
                }}
              >
                Tools
              </Typography>

              {/* Tools List */}
              <Box>
                <List sx={{ py: 0 }}>
                  {toolItems.map((item) => {
                    const isSelected = selected === item.label;
                    return (
                      <React.Fragment key={item.label}>
                        <ListItemButton
                          onClick={() => {
                            if (item.label === "Scheduler") {
                              setSchedulerOpen((prev) => !prev);
                            } else {
                              handleToolClick(item.label);
                              setSchedulerOpen(false);
                            }
                          }}
                          sx={getButtonStyles(isSelected)}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: "32px",
                              "& svg": {
                                width: 20,
                                height: 20,
                                filter: getIconFilter(item.label, isSelected),
                              },
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: "14px",
                              color: isSelected ? "#FFF" : "#000",
                            }}
                          />
                          {item.label === "Scheduler" && (
                            <Box sx={{ ml: "auto" }}>
                              {schedulerOpen ? (
                                <ExpandLessIcon sx={{ fontSize: "18px", color: isSelected ? "#FFF" : "#000" }} />
                              ) : (
                                <ExpandMoreIcon sx={{ fontSize: "18px", color: isSelected ? "#FFF" : "#000" }} />
                              )}
                            </Box>
                          )}
                        </ListItemButton>

                        {item.label === "Scheduler" && (
                          <Collapse in={schedulerOpen} timeout="auto" unmountOnExit>
                            <List sx={{ pl: 4, py: 0 }}>
                              <ListItemButton
                                onClick={() => {
                                  handleToolClick("LinkedIn");
                                }}
                                sx={{
                                  borderRadius: "8px",
                                  mb: 0.5,
                                  backgroundColor: selected === "LinkedIn" ? "#E3F2FD" : "transparent",
                                  "&:hover": {
                                    backgroundColor: selected === "LinkedIn" ? "#E3F2FD" : "rgba(62,163,255,0.1)",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary="LinkedIn"
                                  primaryTypographyProps={{
                                    fontSize: "14px",
                                    color: selected === "LinkedIn" ? "#3EA3FF" : "#000",
                                    fontWeight: selected === "LinkedIn" ? 500 : 400,
                                  }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                onClick={() => {
                                  handleToolClick("Calendar");
                                }}
                                sx={{
                                  borderRadius: "8px",
                                  mb: 0.5,
                                  backgroundColor: selected === "Calendar" ? "#E3F2FD" : "transparent",
                                  "&:hover": {
                                    backgroundColor: selected === "Calendar" ? "#E3F2FD" : "rgba(62,163,255,0.1)",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary="Calendar"
                                  primaryTypographyProps={{
                                    fontSize: "14px",
                                    color: selected === "Calendar" ? "#3EA3FF" : "#000",
                                    fontWeight: selected === "Calendar" ? 500 : 400,
                                  }}
                                />
                              </ListItemButton>
                            </List>
                          </Collapse>
                        )}
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            </Box>
          </>
        )}

        {/* Collapsed view - only icons */}
        {isCollapsed && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
            {documentItems.slice(0, 3).map((item) => {
              const isSelected = selected === item.label;
              return (
                <IconButton
                  key={item.label}
                  onClick={() => handleDocumentClick(item.label)}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: isSelected ? "#3EA3FF" : "transparent",
                    position: "relative",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? "#3EA3FF"
                        : "rgba(62,163,255,0.1)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "-16px",
                      top: 0,
                      height: "100%",
                      width: isSelected ? "4px" : "0px",
                      backgroundColor: "#3EA3FF",
                      borderRadius: "0 4px 4px 0",
                    },
                  }}
                >
                  <Box
                    sx={{
                      "& svg": {
                        width: 20,
                        height: 20,
                        filter: getIconFilter(item.label, isSelected),
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                </IconButton>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Bottom Section */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid #E0E0E0",
            flexShrink: 0,
          }}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              mr: 1.5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {currentProject?.organization_name 
              ? getOrganizationInitials(currentProject.organization_name)
              : "KS"
            }
          </Avatar>
          <Box
            onClick={handleOpen}
            sx={{
              cursor: "pointer",
              p: 1,
              borderRadius: "8px",
              flex: 1,
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentProject?.organization_name || "Kavtech Solution"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#555", opacity: 0.7 }}>
              Basic Plan
            </Typography>
          </Box>

          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                p: 3,
                width: 400,
              }}
            >
              <CreateProject onCreate={handleOpen} onClose={handleClose} />
            </Box>
          </Modal>
        </Box>
      )}

      {isCollapsed && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            borderTop: "1px solid #E0E0E0",
            flexShrink: 0,
          }}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {currentProject?.organization_name 
              ? getOrganizationInitials(currentProject.organization_name)
              : "KS"
            }
          </Avatar>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;