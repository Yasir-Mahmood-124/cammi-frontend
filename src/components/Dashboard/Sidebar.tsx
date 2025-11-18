"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  Modal,
} from "@mui/material";

import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

import {
  Clarify,
  Dashboard,
  Align,
  Mobilize,
  Moniter,
  Iterate,
  BrandSetup,
  LeadCalculator,
  Scheduler,
  FeedbackIcon,
  Logo,
  CollapseIcon,
  ClosedTab,
  OpenTab,
  CammiHead,
} from "@/assests/icons";
import CreateProject from "./CreateProject";

interface CurrentProject {
  organization_id: string;
  organization_name: string;
  project_id: string;
  project_name: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [selectedItem, setSelectedItem] = useState<string>("Dashboard");
  const [selectedParent, setSelectedParent] = useState<string>("");
  // const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(
    null
  );

  const router = useRouter();
  const pathname = usePathname();

  // Map document labels to routes
  const documentRoutes: Record<string, string> = {
    "GTM Document": "/dashboard/gtm",
    "Ideal Customer Profile": "/dashboard/icp",
    "Strategy Roadmap": "/dashboard/strategy-roadmap",
    "Messaging framework": "/dashboard/messaging-framework",
    "Brand identity": "/dashboard/brand-identity",
    "Quarterly Plan": "/dashboard/quarterly-marketing-plan",
    "Content Strategy": "/dashboard/content-strategy",
    "Campaign Brief ": "/dashboard/campaign-brief",
    "SEO/AEO Playbook": "/dashboard/seo-aeo-playbook",
    "Website landing page": "/dashboard/website-landing-page",
    Blog: "/dashboard/blog",
    "Social Media Post": "/dashboard/social-media-post",
    "Email Templates": "/dashboard/email-templates",
    "Case Studies": "/dashboard/case-studies",
    "Sales Deck": "/dashboard/sales-deck",
    "One-pager": "/dashboard/one-pager",
    Dashboard: "/dashboard",
    Recommendations: "/dashboard/recommendations",
    "Updated Assets": "/dashboard/updated-assets",
  };

  // Map tool labels to routes
  const toolRoutes: Record<string, string> = {
    "Brand Setup": "/dashboard/data-upload",
    "Lead Calculator": "/dashboard/lead-calculator",
    Scheduler: "/dashboard/scheduler",
    LinkedIn: "/dashboard/scheduler/linkedin",
    Calendar: "/dashboard/scheduler/calendar",
  };

  // Map Feedback labels to routes
  const feedbackRoutes: Record<string, string> = {
    Feedback: "/dashboard/feedback",
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
      setSelectedItem("Dashboard");
      setSelectedParent("");
    } else {
      // Find which document matches the current path
      const matchedDoc = Object.entries(documentRoutes).find(
        ([_, route]) => pathname === route
      );
      if (matchedDoc) {
        setSelectedItem(matchedDoc[0]);
        // Find parent for this document
        const parent = documentGenerationItems.find((item) =>
          item.subItems?.includes(matchedDoc[0])
        );
        if (parent) {
          setSelectedParent(parent.text);
          setOpenMenus((prev) => ({ ...prev, [parent.text]: true }));
        }
        return;
      }

      // Find which tool matches the current path
      const matchedTool = Object.entries(toolRoutes).find(
        ([_, route]) => pathname === route
      );
      if (matchedTool) {
        setSelectedItem(matchedTool[0]);
        // Auto-open scheduler dropdown if LinkedIn or Calendar is selected
        if (matchedTool[0] === "LinkedIn" || matchedTool[0] === "Calendar") {
          setSelectedParent("Scheduler");
          setOpenMenus((prev) => ({ ...prev, Scheduler: true }));
        } else {
          setSelectedParent("");
        }
        return;
      }

      // Check feedback routes
      const matchedFeedback = Object.entries(feedbackRoutes).find(
        ([_, route]) => pathname === route
      );
      if (matchedFeedback) {
        setSelectedItem(matchedFeedback[0]);
        setSelectedParent("");
      }
    }
  }, [pathname]);

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

  const handleMenuClick = (itemName: string, hasSubItems: boolean = true) => {
    if (isCollapsed && hasSubItems) {
      setIsCollapsed(false);
    }
    if (hasSubItems) {
      setOpenMenus((prev) => {
        const newState: { [key: string]: boolean } = {};
        Object.keys(prev).forEach((key) => {
          newState[key] = false;
        });
        newState[itemName] = !prev[itemName];
        return newState;
      });
      setSelectedItem(itemName);
      setSelectedParent("");
    }
  };

  const handleSubmenuClick = (
    itemName: string,
    parentName: string,
    requiresProject: boolean = false
  ) => {
    // Check if project exists for document generation items
    if (requiresProject && !checkProjectExists()) {
      toast.error("Please create or select a project first");
      setOpen(true);
      return;
    }

    setSelectedItem(itemName);
    setSelectedParent(parentName);

    // Close all open menus except the parent of the selected item
    if (parentName) {
      // If there's a parent, keep only that parent open
      setOpenMenus({ [parentName]: true });
    } else {
      // If no parent (Dashboard, Feedback), close all menus
      setOpenMenus({});
    }

    // Navigate based on the route
    const route =
      documentRoutes[itemName] ||
      toolRoutes[itemName] ||
      feedbackRoutes[itemName];
    if (route) {
      router.push(route);
    } else if (itemName === "Dashboard" && !parentName) {
      router.push("/dashboard");
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setOpenMenus({});
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    loadCurrentProject();
  };

  const documentGenerationItems = [
    {
      text: "Clarify",
      icon: Clarify,
      subItems: [
        "GTM Document",
        "Ideal Customer Profile",
        "Strategy Roadmap",
        "Messaging framework",
        "Brand identity",
      ],
    },
    {
      text: "Align",
      icon: Align,
      subItems: [
        "Quarterly Plan",
        "Content Strategy",
        "Campaign Brief ",
        "SEO/AEO Playbook",
      ],
    },
    {
      text: "Mobilize",
      icon: Mobilize,
      subItems: [
        "Website landing page",
        "Blog",
        "Social Media Post",
        "Email Templates",
        "Case Studies",
        "Sales Deck",
        "One-pager",
      ],
    },
    {
      text: "Monitor",
      icon: Moniter,
      subItems: ["Dashboard"],
    },
    {
      text: "Iterate",
      icon: Iterate,
      subItems: ["Recommendations", "Updated Assets"],
    },
  ];

  const toolsItems = [
    {
      text: "Brand Setup",
      icon: BrandSetup,
    },
    {
      text: "Lead Calculator",
      icon: LeadCalculator,
    },
    {
      text: "Scheduler",
      icon: Scheduler,
      subItems: ["LinkedIn", "Calendar"],
    },
  ];

  const renderIcon = (
    IconComponent: any,
    itemText: string,
    hasSubItems?: boolean
  ) => {
    const isSelected = selectedItem === itemText;
    const isParentSelected = selectedParent === itemText;
    const shouldBeColored =
      isCollapsed && (isSelected || isParentSelected)
        ? "#3EA3FF"
        : isSelected && !hasSubItems
        ? "#FFFFFF"
        : isSelected || isParentSelected
        ? "#3EA3FF"
        : "#000000";

    return (
      <Box
        component={IconComponent}
        sx={{
          width: 24,
          height: 20,
          mr: isCollapsed ? 0 : 1.5,
          "& path": {
            fill: shouldBeColored,
          },
        }}
      />
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 70 : 240,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: isCollapsed ? 70 : 240,
          boxSizing: "border-box",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E0E0E0",
          height: "100vh",
          overflow: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Logo and Toggle Button */}
        <Box
          sx={{
            px: isCollapsed ? 1 : 2,
            pt: 1,
            pb: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
          }}
        >
          {!isCollapsed && (
            <Box
              component={Logo}
              alt="Cammi Logo"
              sx={{
                height: 50,
                width: "auto",
                display: "flex",
                alignItems: "center",
                color: "#000",
                marginLeft: "45px",
              }}
            />
          )}
          <IconButton
            onClick={toggleSidebar}
            sx={{
              padding: isCollapsed ? "3px" : "6px",
              borderRadius: isCollapsed ? "10px" : "8px",
              color: "#757575",
              transition: "background-color 0.2s ease",
              "&:hover": {
                backgroundColor: "#F0F0F0",
              },
            }}
          >
            {isCollapsed ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CammiHead />
              </Box>
            ) : (
              <Box
                component={CollapseIcon}
                alt="Collapse Icon"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                }}
              />
            )}
          </IconButton>
        </Box>

        {/* Scrollable Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#BDBDBD",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#9E9E9E",
            },
          }}
        >
          {/* Main Menu */}
          <List sx={{ px: isCollapsed ? 1 : 2, pt: 0, pb: 0 }}>
            <ListItem disablePadding>
              <Tooltip title={isCollapsed ? "Dashboard" : ""} placement="right">
                <ListItemButton
                  onClick={() => handleSubmenuClick("Dashboard", "", false)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.2,
                    py: 0.3,
                    backgroundColor:
                      isCollapsed || selectedItem !== "Dashboard"
                        ? "transparent"
                        : "#3EA3FF",
                    position: "relative",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    "&:hover": {
                      backgroundColor:
                        selectedItem === "Dashboard" && !isCollapsed
                          ? "#3EA3FF"
                          : "#F5F5F5",
                    },
                    "&::before":
                      selectedItem === "Dashboard"
                        ? {
                            content: '""',
                            position: "absolute",
                            left: -8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "4px",
                            height: "20px",
                            backgroundColor: "#3EA3FF",
                            borderRadius: "0 4px 4px 0",
                          }
                        : {},
                  }}
                >
                  <Box
                    component={Dashboard}
                    sx={{
                      fontSize: 20,
                      mr: isCollapsed ? 0 : 1.5,
                      color:
                        isCollapsed && selectedItem === "Dashboard"
                          ? "#3EA3FF"
                          : selectedItem === "Dashboard"
                          ? "#FFFFFF"
                          : "#000000",
                      "& path": {
                        fill:
                          isCollapsed && selectedItem === "Dashboard"
                            ? "#3EA3FF"
                            : selectedItem === "Dashboard"
                            ? "#FFFFFF"
                            : "#000000",
                      },
                    }}
                  />
                  {!isCollapsed && (
                    <ListItemText
                      primary="Dashboard"
                      primaryTypographyProps={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color:
                          selectedItem === "Dashboard" ? "#FFFFFF" : "#000000",
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>

          {/* Divider */}
          <Box sx={{ my: 0.3 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* Document Generation Section */}
          <Box sx={{ px: isCollapsed ? 1 : 2, mt: 0.2 }}>
            {!isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  color: "#9E9E9E",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  mb: 0.3,
                  display: "block",
                }}
              >
                Document Generation
              </Typography>
            )}

            <List sx={{ mt: 0.1, pb: 0 }}>
              {documentGenerationItems.map((item) => (
                <Box key={item.text}>
                  <ListItem disablePadding>
                    <Tooltip
                      title={isCollapsed ? item.text : ""}
                      placement="right"
                    >
                      <ListItemButton
                        onClick={() => handleMenuClick(item.text, true)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.15,
                          py: 0.3,
                          backgroundColor: "transparent",
                          position: "relative",
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          "&:hover": {
                            backgroundColor: "#F5F5F5",
                          },
                          "&::before":
                            selectedItem === item.text ||
                            selectedParent === item.text
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  left: -8,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: "4px",
                                  height: "20px",
                                  backgroundColor: "#3EA3FF",
                                  borderRadius: "0 4px 4px 0",
                                }
                              : {},
                        }}
                      >
                        {renderIcon(item.icon, item.text, true)}

                        {!isCollapsed && (
                          <>
                            <ListItemText
                              primary={item.text}
                              primaryTypographyProps={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color:
                                  selectedItem === item.text ||
                                  selectedParent === item.text
                                    ? "#3EA3FF"
                                    : "#000000",
                              }}
                            />
                            {openMenus[item.text] ? (
                              <Box
                                sx={{
                                  width: 18,
                                  height: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color:
                                    selectedItem === item.text ||
                                    selectedParent === item.text
                                      ? "#3EA3FF"
                                      : "#757575",
                                }}
                              >
                                <OpenTab />
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  width: 18,
                                  height: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color:
                                    selectedItem === item.text ||
                                    selectedParent === item.text
                                      ? "#3EA3FF"
                                      : "#757575",
                                }}
                              >
                                <ClosedTab />
                              </Box>
                            )}
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                  {!isCollapsed && (
                    <Collapse
                      in={openMenus[item.text]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List
                        component="div"
                        disablePadding
                        sx={{ position: "relative" }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: 32,
                            top: 0,
                            bottom: 0,
                            width: "2px",
                            backgroundColor: "#D2E9FF",
                          }}
                        />
                        {item.subItems.map((subItem, index) => (
                          <ListItem key={subItem} disablePadding>
                            <ListItemButton
                              onClick={() =>
                                handleSubmenuClick(subItem, item.text, true)
                              }
                              sx={{
                                pl: 1.5,
                                py: 0.3,
                                borderRadius: "4px",
                                mb:
                                  index === item.subItems.length - 1 ? 0.15 : 0,
                                ml: "38px",
                                mr: 1,
                                backgroundColor:
                                  selectedItem === subItem
                                    ? "#3EA3FF"
                                    : "transparent",
                                position: "relative",
                                "&:hover": {
                                  backgroundColor:
                                    selectedItem === subItem
                                      ? "#3EA3FF"
                                      : "#F5F5F5",
                                },
                              }}
                            >
                              <ListItemText
                                primary={subItem}
                                primaryTypographyProps={{
                                  fontSize: "12px",
                                  fontWeight:
                                    selectedItem === subItem ? 600 : 400,
                                  color:
                                    selectedItem === subItem
                                      ? "#FFFFFF"
                                      : "#000000",
                                  whiteSpace: "nowrap",
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              ))}
            </List>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 0.3 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* Tools Section */}
          <Box sx={{ px: isCollapsed ? 1 : 2, mt: 0.2 }}>
            {!isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  color: "#9E9E9E",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  mb: 0.3,
                }}
              >
                Tools
              </Typography>
            )}
            <List sx={{ mt: 0.1, pb: 0 }}>
              {toolsItems.map((item) => (
                <Box key={item.text}>
                  <ListItem disablePadding>
                    <Tooltip
                      title={isCollapsed ? item.text : ""}
                      placement="right"
                    >
                      <ListItemButton
                        onClick={() =>
                          item.subItems
                            ? handleMenuClick(item.text, true)
                            : handleSubmenuClick(item.text, "", false)
                        }
                        sx={{
                          borderRadius: 1,
                          mb: 0.15,
                          py: 0.3,
                          backgroundColor:
                            isCollapsed ||
                            !(selectedItem === item.text && !item.subItems)
                              ? "transparent"
                              : "#3EA3FF",
                          position: "relative",
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          "&:hover": {
                            backgroundColor:
                              selectedItem === item.text &&
                              !item.subItems &&
                              !isCollapsed
                                ? "#3EA3FF"
                                : "#F5F5F5",
                          },
                          "&::before":
                            selectedItem === item.text ||
                            selectedParent === item.text
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  left: -8,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: "4px",
                                  height: "20px",
                                  backgroundColor: "#3EA3FF",
                                  borderRadius: "0 4px 4px 0",
                                }
                              : {},
                        }}
                      >
                        {renderIcon(item.icon, item.text, !!item.subItems)}
                        {!isCollapsed && (
                          <>
                            <ListItemText
                              primary={item.text}
                              primaryTypographyProps={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color:
                                  selectedItem === item.text && !item.subItems
                                    ? "#FFFFFF"
                                    : selectedItem === item.text ||
                                      selectedParent === item.text
                                    ? "#3EA3FF"
                                    : "#000000",
                              }}
                            />
                            {item.subItems &&
                              (openMenus[item.text] ? (
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color:
                                      selectedItem === item.text ||
                                      selectedParent === item.text
                                        ? "#3EA3FF"
                                        : "#757575",
                                  }}
                                >
                                  <OpenTab />
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color:
                                      selectedItem === item.text ||
                                      selectedParent === item.text
                                        ? "#3EA3FF"
                                        : "#757575",
                                  }}
                                >
                                  <ClosedTab />
                                </Box>
                              ))}
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                  {!isCollapsed && item.subItems && (
                    <Collapse
                      in={openMenus[item.text]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List
                        component="div"
                        disablePadding
                        sx={{ position: "relative" }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: 32,
                            top: 0,
                            bottom: 0,
                            width: "2px",
                            backgroundColor: "#D2E9FF",
                          }}
                        />
                        {item.subItems.map((subItem, index) => (
                          <ListItem key={subItem} disablePadding>
                            <ListItemButton
                              onClick={() =>
                                handleSubmenuClick(subItem, item.text, false)
                              }
                              sx={{
                                pl: 1.5,
                                py: 0.3,
                                borderRadius: "4px",
                                mb:
                                  index === item.subItems.length - 1 ? 0.15 : 0,
                                ml: "38px",
                                mr: 1,
                                backgroundColor:
                                  selectedItem === subItem
                                    ? "#3EA3FF"
                                    : "transparent",
                                position: "relative",
                                "&:hover": {
                                  backgroundColor:
                                    selectedItem === subItem
                                      ? "#3EA3FF"
                                      : "#F5F5F5",
                                },
                              }}
                            >
                              <ListItemText
                                primary={subItem}
                                primaryTypographyProps={{
                                  fontSize: "12px",
                                  fontWeight:
                                    selectedItem === subItem ? 600 : 400,
                                  color:
                                    selectedItem === subItem
                                      ? "#FFFFFF"
                                      : "#000000",
                                  whiteSpace: "nowrap",
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              ))}
            </List>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 0.3 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* User Feedback Section */}
          <Box sx={{ px: isCollapsed ? 1 : 2, mb: 0.3 }}>
            {!isCollapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  color: "#9E9E9E",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  mb: 0.3,
                }}
              >
                User Feedback
              </Typography>
            )}
            <List sx={{ mt: 0.1, pb: 0 }}>
              <ListItem disablePadding>
                <Tooltip
                  title={isCollapsed ? "Feedback" : ""}
                  placement="right"
                >
                  <ListItemButton
                    onClick={() => handleSubmenuClick("Feedback", "", false)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.15,
                      py: 0.3,
                      backgroundColor:
                        isCollapsed || selectedItem !== "Feedback"
                          ? "transparent"
                          : "#3EA3FF",
                      position: "relative",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      "&:hover": {
                        backgroundColor:
                          selectedItem === "Feedback" && !isCollapsed
                            ? "#3EA3FF"
                            : "#F5F5F5",
                      },
                      "&::before":
                        selectedItem === "Feedback"
                          ? {
                              content: '""',
                              position: "absolute",
                              left: -8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "4px",
                              height: "20px",
                              backgroundColor: "#3EA3FF",
                              borderRadius: "0 4px 4px 0",
                            }
                          : {},
                    }}
                  >
                    <Box
                      component={FeedbackIcon}
                      sx={{
                        fontSize: 20,
                        mr: isCollapsed ? 0 : 2,
                        color:
                          isCollapsed && selectedItem === "Feedback"
                            ? "#3EA3FF"
                            : selectedItem === "Feedback"
                            ? "#FFFFFF"
                            : "#000000",
                        "& path": {
                          fill:
                            isCollapsed && selectedItem === "Feedback"
                              ? "#3EA3FF"
                              : selectedItem === "Feedback"
                              ? "#FFFFFF"
                              : "#000000",
                        },
                      }}
                    />
                    {!isCollapsed && (
                      <ListItemText
                        primary="Feedback"
                        primaryTypographyProps={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color:
                            selectedItem === "Feedback" ? "#FFFFFF" : "#000000",
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </List>
          </Box>
        </Box>

        {/* Divider before bottom fixed section */}
        <Box sx={{ borderTop: "1px solid #E0E0E0" }} />

        {/* Bottom Project Info - Fixed at bottom */}
        {!isCollapsed && (
          <Box
            sx={
              {
                // px: 2,
                // py: 1,
              }
            }
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 0.8,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                  borderRadius: 1,
                },
              }}
              onClick={handleOpen}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#FFF",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {currentProject?.organization_name
                    ? getOrganizationInitials(currentProject.organization_name)
                    : "CP"}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      lineHeight: 1.4,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {currentProject?.organization_name || "Create Project"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#757575",
                      lineHeight: 1.4,
                      fontWeight: 400,
                    }}
                  >
                    Basic plan
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: "50%",
                  border: "1px solid #5C5C5C",
                  backgroundColor: "#fff",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#bdbdbd",
                  },
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#565656"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </Box>
            </Box>
          </Box>
        )}

        {isCollapsed && (
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#FFF",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
              onClick={handleOpen}
            >
              {currentProject?.organization_name
                ? getOrganizationInitials(currentProject.organization_name)
                : "CP"}
            </Box>
          </Box>
        )}
      </Box>

      {/* Create Project Modal */}
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
    </Drawer>
  );
};

export default Sidebar;