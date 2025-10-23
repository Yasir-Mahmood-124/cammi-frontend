// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   IconButton,
//   TextField,
//   Button,
//   Box,
//   Typography,
//   Avatar,
//   Stack,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import Cookies from "js-cookie";
// import { useEditProfileMutation } from "@/redux/services/settings/profileSettings";

// interface User {
//   email: string;
//   id: string;
//   name: string;
// }

// interface ProfileSettingsModalProps {
//   open: boolean;
//   onClose: () => void;
//   user?: User;
// }

// export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
//   open,
//   onClose,
//   user,
// }) => {
//   const [userName, setUserName] = useState<string>("");
//   const [profileImage, setProfileImage] = useState<string>("/default-avatar.jpg");
//   const [email, setEmail] = useState<string>("");

//   // 🔹 RTK Query mutation hook
//   const [editProfile, { isLoading, isSuccess, isError, data }] = useEditProfileMutation();

//   useEffect(() => {
//     if (user) {
//       setUserName(user.name);
//       setEmail(user.email);
//     }
//   }, [user, open]);

//   // 🔹 Convert image file to base64 and preview it
//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfileImage(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // 🔹 Delete profile picture
//   const handleDeleteImage = () => {
//     setProfileImage("/default-avatar.jpg");
//   };

//   // 🔹 Save / Update Profile
//   const handleSave = async () => {
//     const session_id = Cookies.get("token");
//     if (!session_id) {
//       alert("Session expired. Please log in again.");
//       return;
//     }

//     try {
//       // 🔸 Call API
//       const response = await editProfile({
//         session_id,
//         name: userName,
//         picture: profileImage,
//       }).unwrap();

//       console.log("Profile Updated:", response);

//       // 🔸 Update localStorage
//       const updatedUser = {
//         ...user,
//         name: userName,
//         profileImage: profileImage,
//       };
//       localStorage.setItem("user", JSON.stringify(updatedUser));

//       // 🔸 Give feedback
//       alert("Profile updated successfully!");
//       onClose();
//     } catch (error) {
//       console.error("Profile update failed:", error);
//       alert("Failed to update profile. Please try again.");
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="sm"
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: "24px",
//           maxHeight: "90vh",
//         },
//       }}
//     >
//       <Box
//         sx={{
//           position: "relative",
//           p: 2.5,
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {/* Close Button */}
//         <IconButton
//           onClick={onClose}
//           sx={{
//             position: "absolute",
//             right: 12,
//             top: 12,
//             color: "#999",
//             width: 32,
//             height: 32,
//             "&:hover": {
//               backgroundColor: "#f0f0f0",
//             },
//           }}
//         >
//           <CloseIcon fontSize="small" />
//         </IconButton>

//         {/* Header */}
//         <Box sx={{ mb: 2.5, pr: 4 }}>
//           <Typography
//             variant="h6"
//             sx={{
//               fontWeight: 700,
//               color: "#000",
//               mb: 0.5,
//               fontSize: "18px",
//             }}
//           >
//             Profile Settings
//           </Typography>
//           <Typography
//             sx={{
//               color: "#007AFF",
//               fontSize: "13px",
//               fontWeight: 500,
//             }}
//           >
//             {email}
//           </Typography>
//         </Box>

//         {/* User Name Section */}
//         <Box sx={{ mb: 2.5 }}>
//           <Typography
//             sx={{
//               fontSize: "13px",
//               fontWeight: 600,
//               color: "#333",
//               mb: 0.75,
//               textTransform: "uppercase",
//               letterSpacing: "0.5px",
//             }}
//           >
//             User Name
//           </Typography>
//           <TextField
//             fullWidth
//             value={userName}
//             onChange={(e) => setUserName(e.target.value)}
//             variant="outlined"
//             placeholder="Enter your name"
//             size="small"
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 backgroundColor: "#f8f8f8",
//                 borderRadius: "8px",
//                 fontSize: "14px",
//                 "& fieldset": {
//                   borderColor: "#e5e5e5",
//                 },
//                 "&:hover fieldset": {
//                   borderColor: "#d0d0d0",
//                 },
//                 "&.Mui-focused fieldset": {
//                   borderColor: "#007AFF",
//                 },
//               },
//             }}
//           />
//         </Box>

//         {/* User Profile Section */}
//         <Box sx={{ mb: 2 }}>
//           <Typography
//             sx={{
//               fontSize: "13px",
//               fontWeight: 600,
//               color: "#333",
//               mb: 1.75,
//               textTransform: "uppercase",
//               letterSpacing: "0.5px",
//             }}
//           >
//             User Profile
//           </Typography>

//           {/* Profile Image */}
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               mb: 2.5,
//             }}
//           >
//             <Avatar
//               src={profileImage}
//               sx={{
//                 width: 120,
//                 height: 120,
//                 mb: 1.5,
//                 border: "3px solid #f0f0f0",
//                 boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
//               }}
//             />

//             {/* Image Action Buttons */}
//             <Stack direction="row" spacing={1}>
//               <label htmlFor="image-upload">
//                 <input
//                   id="image-upload"
//                   type="file"
//                   accept="image/*"
//                   hidden
//                   onChange={handleImageChange}
//                 />
//                 <Button
//                   component="span"
//                   sx={{
//                     minWidth: "40px",
//                     width: "40px",
//                     height: "40px",
//                     p: 0,
//                     backgroundColor: "#f0f0f0",
//                     color: "#666",
//                     borderRadius: "50%",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     transition: "all 0.2s ease",
//                     "&:hover": {
//                       backgroundColor: "#007AFF",
//                       color: "#fff",
//                     },
//                   }}
//                 >
//                   <EditIcon sx={{ fontSize: "18px" }} />
//                 </Button>
//               </label>

//               <Button
//                 onClick={handleDeleteImage}
//                 sx={{
//                   minWidth: "40px",
//                   width: "40px",
//                   height: "40px",
//                   p: 0,
//                   backgroundColor: "#f0f0f0",
//                   color: "#999",
//                   borderRadius: "50%",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   transition: "all 0.2s ease",
//                   "&:hover": {
//                     backgroundColor: "#ff4444",
//                     color: "#fff",
//                   },
//                 }}
//               >
//                 <DeleteIcon sx={{ fontSize: "18px" }} />
//               </Button>
//             </Stack>
//           </Box>

//           {/* Save Button */}
//           <Button
//             fullWidth
//             onClick={handleSave}
//             disabled={isLoading}
//             sx={{
//               backgroundColor: "#007AFF",
//               color: "white",
//               textTransform: "none",
//               fontSize: "15px",
//               fontWeight: 600,
//               py: 1.25,
//               borderRadius: "10px",
//               transition: "all 0.2s ease",
//               "&:hover": {
//                 backgroundColor: "#0056b3",
//                 boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
//               },
//               "&:active": {
//                 transform: "scale(0.98)",
//               },
//             }}
//           >
//             {isLoading ? "Saving..." : "Save"}
//           </Button>
//         </Box>
//       </Box>
//     </Dialog>
//   );
// };


"use client";
import React from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: 4,
          textAlign: "center",
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: "#999",
          "&:hover": { backgroundColor: "#f0f0f0" },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* Coming Soon Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 64, color: "#007AFF", mb: 2 }} />
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#000", mb: 1 }}
        >
          Coming Soon 🚀
        </Typography>
        <Typography
          sx={{ color: "#555", fontSize: "15px", maxWidth: "380px", mb: 3 }}
        >
          We’re working hard to bring this feature to life. Stay tuned!
        </Typography>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: "#007AFF",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            "&:hover": { backgroundColor: "#0056b3" },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};
