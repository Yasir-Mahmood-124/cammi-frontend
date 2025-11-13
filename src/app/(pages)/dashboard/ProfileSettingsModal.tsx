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
    borderRadius: { xs: '12px', sm: '16px' },
    padding: { xs: '16px', sm: '20px', md: '24px' },
    minWidth: { xs: '90vw', sm: '400px' },
    maxWidth: { xs: '95vw', sm: '500px', md: '600px', lg: '700px' },
    maxHeight: { xs: '90vh', sm: '85vh' },
    margin: { xs: '16px', sm: '32px' },
    width: '500px',
    overflow: 'hidden', // Prevent scrollbars on dialog itself
    display: 'flex',
    flexDirection: 'column',
  },
}));

const ProfileImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '200px',
  maxWidth: '100%',
  aspectRatio: '1',
  margin: '0 auto',
  marginTop: '16px',
  marginBottom: '16px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '150px',
    marginTop: '12px',
    marginBottom: '12px',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: '100%',
  fontSize: '72px',
  backgroundColor: '#e0e0e0',
  color: '#666',
  [theme.breakpoints.down('sm')]: {
    fontSize: '48px',
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '20px',
  padding: '4px 8px',
  [theme.breakpoints.down('sm')]: {
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '16px',
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
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
  [theme.breakpoints.down('sm')]: {
    padding: '10px 36px',
    fontSize: '14px',
  },
}));

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
      <Box sx={{ position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: { xs: -4, sm: -8 },
            top: { xs: -4, sm: -8 },
            color: '#999',
            zIndex: 1,
            margin: 1.5,
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: '20px', sm: '24px' } }} />
        </IconButton>

        <DialogContent 
          sx={{ 
            padding: { xs: '16px 8px', sm: '20px 16px', md: '24px' },
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            maxWidth: '100%',
            boxSizing: 'border-box',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: { xs: 0.5, sm: 1 },
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
              }}
            >
              Profile Settings
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#2196F3',
                fontSize: { xs: '14px', sm: '16px' },
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
                px: 1,
              }}
            >
              {user?.email || ''}
            </Typography>
          </Box>

          {/* User Name Field */}
          <Box sx={{ mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '0.975rem' },
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
                  fontSize: { xs: '14px', sm: '16px' },
                  maxWidth: '100%',
                },
              }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#666',
                  color: '#666',
                },
                maxWidth: '100%',
                width: '100%',
              }}
            />
          </Box>

          {/* User Profile Image */}
          <Box sx={{ px: { xs: 1, sm: 0 } }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#333',
                fontWeight: 600,
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '0.975rem' },
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
                  sx={{ 
                    color: '#2196F3',
                    padding: { xs: '4px', sm: '8px' },
                  }}
                >
                  <EditIcon sx={{ fontSize: { xs: '18px', sm: '20px' } }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleImageDelete}
                  sx={{ 
                    color: '#f44336',
                    padding: { xs: '4px', sm: '8px' },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: { xs: '18px', sm: '20px' } }} />
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 4 } }}>
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