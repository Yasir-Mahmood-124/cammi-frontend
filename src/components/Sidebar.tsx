"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

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
} from "@/assests/icons";

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [selectedItem, setSelectedItem] = useState<string>("Dashboard");
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleMenuClick = (itemName: string) => {
    if (isCollapsed) {
      setIsCollapsed(false); // Auto-expand when clicking a collapsible item
    }
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
  };

  const handleSubmenuClick = (itemName: string, parentName: string) => {
    setSelectedItem(itemName);
    setSelectedParent(parentName);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Close all menus when collapsing
    if (!isCollapsed) {
      setOpenMenus({});
    }
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
          width: 20,
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
            px: isCollapsed ? 1 : 3,
            pt: 1.5,
            pb: 0.8,
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
              }}
            />
          )}
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              color: "#757575",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            {isCollapsed ? (
              <MenuIcon sx={{ fontSize: 20 }} />
            ) : (
              <MenuOpenIcon sx={{ fontSize: 20 }} />
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
              <Tooltip
                title={isCollapsed ? "Dashboard" : ""}
                placement="right"
              >
                <ListItemButton
                  onClick={() => handleSubmenuClick("Dashboard", "")}
                  sx={{
                    borderRadius: 1,
                    mb: 0.2,
                    py: 0.4,
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
          <Box sx={{ my: 0.5 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* Document Generation Section */}
          <Box sx={{ px: isCollapsed ? 1 : 2, mt: 0.3 }}>
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
                }}
              >
                Document Generation
              </Typography>
            )}
            <List sx={{ mt: 0.2, pb: 0 }}>
              {documentGenerationItems.map((item) => (
                <Box key={item.text}>
                  <ListItem disablePadding>
                    <Tooltip
                      title={isCollapsed ? item.text : ""}
                      placement="right"
                    >
                      <ListItemButton
                        onClick={() => handleMenuClick(item.text)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.2,
                          py: 0.4,
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
                              <ExpandMoreIcon
                                sx={{
                                  fontSize: 18,
                                  color:
                                    selectedItem === item.text ||
                                    selectedParent === item.text
                                      ? "#3EA3FF"
                                      : "#757575",
                                }}
                              />
                            ) : (
                              <ChevronRightIcon
                                sx={{
                                  fontSize: 18,
                                  color:
                                    selectedItem === item.text ||
                                    selectedParent === item.text
                                      ? "#3EA3FF"
                                      : "#757575",
                                }}
                              />
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
                                handleSubmenuClick(subItem, item.text)
                              }
                              sx={{
                                pl: 2,
                                py: 0.4,
                                borderRadius: "4px",
                                mb:
                                  index === item.subItems.length - 1 ? 0.2 : 0,
                                ml: "38px",
                                mr: 2,
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
                                  fontSize: "13px",
                                  fontWeight:
                                    selectedItem === subItem ? 600 : 400,
                                  color:
                                    selectedItem === subItem
                                      ? "#FFFFFF"
                                      : "#000000",
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
          <Box sx={{ my: 0.5 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* Tools Section */}
          <Box sx={{ px: isCollapsed ? 1 : 2, mt: 0.3 }}>
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
                }}
              >
                Tools
              </Typography>
            )}
            <List sx={{ mt: 0.2, pb: 0 }}>
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
                            ? handleMenuClick(item.text)
                            : handleSubmenuClick(item.text, "")
                        }
                        sx={{
                          borderRadius: 1,
                          mb: 0.2,
                          py: 0.4,
                          backgroundColor:
                            isCollapsed ||
                            !(selectedItem === item.text && !item.subItems)
                              ? "transparent"
                              : "#3EA3FF",
                          position: "relative",
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          "&:hover": {
                            backgroundColor:
                              selectedItem === item.text && !item.subItems && !isCollapsed
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
                                <ExpandMoreIcon
                                  sx={{
                                    fontSize: 18,
                                    color:
                                      selectedItem === item.text ||
                                      selectedParent === item.text
                                        ? "#3EA3FF"
                                        : "#757575",
                                  }}
                                />
                              ) : (
                                <ChevronRightIcon
                                  sx={{
                                    fontSize: 18,
                                    color:
                                      selectedItem === item.text ||
                                      selectedParent === item.text
                                        ? "#3EA3FF"
                                        : "#757575",
                                  }}
                                />
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
                                handleSubmenuClick(subItem, item.text)
                              }
                              sx={{
                                pl: 2,
                                py: 0.4,
                                borderRadius: "4px",
                                mb:
                                  index === item.subItems.length - 1 ? 0.2 : 0,
                                ml: "38px",
                                mr: 2,
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
                                  fontSize: "13px",
                                  fontWeight:
                                    selectedItem === subItem ? 600 : 400,
                                  color:
                                    selectedItem === subItem
                                      ? "#FFFFFF"
                                      : "#000000",
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
          <Box sx={{ my: 0.5 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* User Feedback Section */}
          <Box sx={{ px: isCollapsed ? 1 : 2, mb: 0.5 }}>
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
                }}
              >
                User Feedback
              </Typography>
            )}
            <List sx={{ mt: 0.2, pb: 0 }}>
              <ListItem disablePadding>
                <Tooltip
                  title={isCollapsed ? "Feedback" : ""}
                  placement="right"
                >
                  <ListItemButton
                    onClick={() => handleSubmenuClick("Feedback", "")}
                    sx={{
                      borderRadius: 1,
                      mb: 0.2,
                      py: 0.4,
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
            sx={{
              px: 2,
              py: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: "#1565C0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #2196F3 0%, #1565C0 100%)",
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#212121",
                      lineHeight: 1.3,
                    }}
                  >
                    Kavtech solution
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#9E9E9E",
                      lineHeight: 1.3,
                    }}
                  >
                    Basic plan
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#F0F0F0",
                    borderRadius: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: "2px solid #BDBDBD",
                    borderRadius: "50%",
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;