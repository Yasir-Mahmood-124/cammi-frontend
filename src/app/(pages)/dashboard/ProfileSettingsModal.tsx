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

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  styled,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Cookies from 'js-cookie';
import { useEditProfileMutation } from '@/redux/services/settings/profileSettings';

interface User {
  email: string;
  id: string;
  name: string;
  picture: string | null;
}

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: '500px',
  },
}));

const ProfileImageContainer = styled(Box)({
  position: 'relative',
  width: '200px',
  height: '200px',
  margin: '0 auto',
  marginTop: '24px',
  marginBottom: '24px',
});

const StyledAvatar = styled(Avatar)({
  width: '100%',
  height: '100%',
  fontSize: '72px',
  backgroundColor: '#e0e0e0',
  color: '#666',
});

const ImageOverlay = styled(Box)({
  position: 'absolute',
  bottom: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '20px',
  padding: '4px 8px',
});

const SaveButton = styled(Button)({
  backgroundColor: '#2196F3',
  color: 'white',
  borderRadius: '24px',
  padding: '12px 48px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#1976D2',
  },
});

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  open,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query mutation
  const [editProfile, { isLoading }] = useEditProfileMutation();

  // Load user data from localStorage
  useEffect(() => {
    if (open) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData: User = JSON.parse(storedUser);
        setUser(userData);
        setUserName(userData.name);
        setProfileImage(userData.picture);
      }
    }
  }, [open]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image delete
  const handleImageDelete = () => {
    setProfileImage(null);
  };

  // Trigger file input click
  const handleEditImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle save
  const handleSave = async () => {
    if (!user) {
      setErrorMessage('User data not found');
      return;
    }

    // Get session_id (token) from cookies using js-cookie
    const sessionId = Cookies.get('token');
    
    if (!sessionId) {
      setErrorMessage('Session token not found. Please login again.');
      return;
    }

    try {
      // Prepare the request body
      const requestBody = {
        session_id: sessionId,
        name: userName,
        picture: profileImage || '', // Send empty string if no picture
      };

      // Call the API
      const response = await editProfile(requestBody).unwrap();

      // Update localStorage with new data
      const updatedUser: User = {
        ...user,
        name: userName,
        picture: profileImage,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Show success message
      setShowSuccess(true);
      setErrorMessage(null);
      setIsEditingName(false);

      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1500);
    } catch (error: any) {
      // Handle error
      const errorMsg = error?.data?.message || error?.message || 'Failed to update profile. Please try again.';
      setErrorMessage(errorMsg);
      console.error('Profile update error:', error);
    }
  };

  // Handle close success message
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  // Handle close error message
  const handleCloseError = () => {
    setErrorMessage(null);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'relative' }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -8,
            top: -8,
            color: '#999',
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ padding: '24px 0' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 1,
              }}
            >
              Profile Settings
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#2196F3',
                fontSize: '16px',
              }}
            >
              {user?.email || ''}
            </Typography>
          </Box>

          {/* User Name Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 1,
              }}
            >
              User Name
            </Typography>
            <TextField
              fullWidth
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!isEditingName}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setIsEditingName(!isEditingName)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                ),
                sx: {
                  backgroundColor: '#f5f5f5',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                },
              }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#666',
                  color: '#666',
                },
              }}
            />
          </Box>

          {/* User Profile Image */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 1,
              }}
            >
              User Profile
            </Typography>
            <ProfileImageContainer>
              <StyledAvatar src={profileImage || undefined}>
                {!profileImage && user?.name ? getInitials(user.name) : ''}
              </StyledAvatar>
              <ImageOverlay>
                <IconButton
                  size="small"
                  onClick={handleEditImageClick}
                  sx={{ color: '#2196F3' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleImageDelete}
                  sx={{ color: '#f44336' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ImageOverlay>
            </ProfileImageContainer>
          </Box>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <SaveButton 
              onClick={handleSave} 
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </SaveButton>
          </Box>
        </DialogContent>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </StyledDialog>
  );
};

export default ProfileSettingsModal;