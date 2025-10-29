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
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Lightbulb as LightbulbIcon,
  Straighten as StraightenIcon,
  PhoneIphone as PhoneIphoneIcon,
  Monitor as MonitorIcon,
  Repeat as RepeatIcon,
  Calculate as CalculateIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  // Feedback as FeedbackIcon,
} from "@mui/icons-material";

import {
  BS,
  Clarify,
  Dashboard,
  Align,
  Mobilize,
  Moniter,
  Iterate,
  BrandSetup,
  GTM,
  ICP,
  KMF,
  LeadCalculator,
  Scheduler,
  SR,
  FeedbackIcon,
  Logo,
} from "@/assests/icons";

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [selectedItem, setSelectedItem] = useState<string>("Dashboard");
  const [selectedParent, setSelectedParent] = useState<string>("");

  const handleMenuClick = (itemName: string) => {
    setOpenMenus((prev) => {
      const newState: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[itemName] = !prev[itemName];
      return newState;
    });
    setSelectedItem(itemName);
    setSelectedParent(""); // Clear parent when selecting main tab
  };

  const handleSubmenuClick = (itemName: string, parentName: string) => {
    setSelectedItem(itemName);
    setSelectedParent(parentName); // Track the parent of this sub-item
  };

  const documentGenerationItems = [
    {
      text: "Clarify",
      icon: (
        <Box
          component={Clarify}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
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
      icon: (
        <Box
          component={Align}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
      subItems: [
        "Quarterly Plan",
        "Content Strategy",
        "Campaign Brief ",
        "SEO/AEO Playbook",
      ],
    },
    {
      text: "Mobilize",
      icon: (
        <Box
          component={Mobilize}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
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
      icon: (
        <Box
          component={Moniter}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
      subItems: ["Dashboard"],
    },
    {
      text: "Iterate",
      icon: (
        <Box
          component={Iterate}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
      subItems: ["Recommendations", "Updated Assets"],
    },
  ];

  const toolsItems = [
    {
      text: "Brand Setup",
      icon: (
        <Box
          component={BrandSetup}
          sx={{
            width: 23,
            height: 23,
            mr: 1,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
    },
    {
      text: "Lead Calculator",
      icon: (
        <Box
          component={LeadCalculator}
          sx={{
            width: 20,
            height: 20,
            mr: 1.5,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
    },
    {
      text: "Scheduler",
      icon: (
        <Box
          component={Scheduler}
          sx={{
            width: 23,
            height: 23,
            mr: 1,
            "& path": {
              fill: selectedItem === "Clarify" ? "#FFFFFF" : "#000000",
            },
          }}
        />
      ),
      subItems: ["LinkedIn", "Calendar"],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E0E0E0",
          height: "100vh",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Logo */}
        <Box sx={{ px: 3, pt: 1.5, pb: 0.8 }}>
          {/* <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#000",
              fontSize: "20px",
              fontFamily: "sans-serif",
            }}
          >
            cammi
          </Typography> */}

          <Box
          component={Logo}
          alt="Cammi Logo"
          sx={{
            height: 50, // adjust based on your logo’s aspect ratio
            width: "auto",
            display: "flex",
            alignItems: "center",
            color: "#000", // if your SVG uses fill="currentColor"
          }}
        />
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
          <List sx={{ px: 2, pt: 0, pb: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleSubmenuClick("Dashboard", "")}
                sx={{
                  borderRadius: 1,
                  mb: 0.2,
                  py: 0.4,
                  backgroundColor:
                    selectedItem === "Dashboard" ? "#3EA3FF" : "transparent",
                  position: "relative",
                  "&:hover": {
                    backgroundColor:
                      selectedItem === "Dashboard" ? "#3EA3FF" : "#F5F5F5",
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
                {/* <DashboardIcon sx={{ fontSize: 20, mr: 1.5, color: selectedItem === 'Dashboard' ? '#FFFFFF' : '#000000' }} />
                <Dashboard sx={{ fontSize: 20, mr: 1.5, color: selectedItem === 'Dashboard' ? '#FFFFFF' : '#000000' }} /> */}

                <Box
                  component={Dashboard}
                  sx={{
                    fontSize: 20,
                    mr: 1.5,
                    color: selectedItem === "Dashboard" ? "#FFFFFF" : "#000000",
                    "& path": {
                      fill:
                        selectedItem === "Dashboard" ? "#FFFFFF" : "#000000",
                    }, // color fix for SVG path
                  }}
                />
                <ListItemText
                  primary="Dashboard"
                  primaryTypographyProps={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: selectedItem === "Dashboard" ? "#FFFFFF" : "#000000",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Divider */}
          <Box sx={{ my: 0.5 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* Document Generation Section */}
          <Box sx={{ px: 2, mt: 0.3 }}>
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
            <List sx={{ mt: 0.2, pb: 0 }}>
              {documentGenerationItems.map((item) => (
                <Box key={item.text}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleMenuClick(item.text)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.2,
                        py: 0.4,
                        backgroundColor: "transparent",
                        position: "relative",
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
                      <Box
                        sx={{
                          mr: 1.5,
                          display: "flex",
                          alignItems: "center",
                          "& svg path": {
                            fill:
                              selectedItem === item.text && !item.subItems
                                ? "#FFFFFF"
                                : selectedItem === item.text ||
                                  selectedParent === item.text
                                ? "#3EA3FF"
                                : "#000000",
                          },
                        }}
                      >
                        {item.icon}
                      </Box>

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
                    </ListItemButton>
                  </ListItem>
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
                      {/* Continuous vertical line for all sub-items */}
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
                              mb: index === item.subItems.length - 1 ? 0.2 : 0,
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
                </Box>
              ))}
            </List>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 0.5 }}>
            <Box sx={{ borderTop: "1px solid #E0E0E0" }} />
          </Box>

          {/* Tools Section */}
          <Box sx={{ px: 2, mt: 0.3 }}>
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
            <List sx={{ mt: 0.2, pb: 0 }}>
              {toolsItems.map((item) => (
                <Box key={item.text}>
                  <ListItem disablePadding>
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
                          selectedItem === item.text && !item.subItems
                            ? "#3EA3FF"
                            : "transparent",
                        position: "relative",
                        "&:hover": {
                          backgroundColor:
                            selectedItem === item.text && !item.subItems
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
                      <Box
                        sx={{
                          mr: 1.5,
                          display: "flex",
                          alignItems: "center",
                          "& svg path": {
                            fill:
                              selectedItem === item.text && !item.subItems
                                ? "#FFFFFF"
                                : selectedItem === item.text ||
                                  selectedParent === item.text
                                ? "#3EA3FF"
                                : "#000000",
                          },
                        }}
                      >
                        {item.icon}
                      </Box>
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
                    </ListItemButton>
                  </ListItem>
                  {item.subItems && (
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
                        {/* Continuous vertical line for all sub-items */}
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
          <Box sx={{ px: 2, mb: 0.5 }}>
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
            <List sx={{ mt: 0.2, pb: 0 }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSubmenuClick("Feedback", "")}
                  sx={{
                    borderRadius: 1,
                    mb: 0.2,
                    py: 0.4,
                    backgroundColor:
                      selectedItem === "Feedback" ? "#3EA3FF" : "transparent",
                    position: "relative",
                    "&:hover": {
                      backgroundColor:
                        selectedItem === "Feedback" ? "#3EA3FF" : "#F5F5F5",
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
                  {/* <FeedbackIcon
                    sx={{
                      fontSize: 20,
                      mr: 1.5,
                      color:
                        selectedItem === "Feedback" ? "#FFFFFF" : "#000000",
                    }}
                  /> */}

                  <Box
                    component={FeedbackIcon}
                    sx={{
                      fontSize: 20,
                      mr: 2,
                      color:
                        selectedItem === "Feedback" ? "#FFFFFF" : "#000000",
                      "& path": {
                        fill:
                          selectedItem === "Feedback" ? "#FFFFFF" : "#000000",
                      }, // color fix for SVG path
                    }}
                  />
                  <ListItemText
                    primary="Feedback"
                    primaryTypographyProps={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color:
                        selectedItem === "Feedback" ? "#FFFFFF" : "#000000",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>

        {/* Divider before bottom fixed section */}
        <Box sx={{ borderTop: "1px solid #E0E0E0" }} />

        {/* Bottom Project Info - Fixed at bottom */}
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
      </Box>
    </Drawer>
  );
};

export default Sidebar;
