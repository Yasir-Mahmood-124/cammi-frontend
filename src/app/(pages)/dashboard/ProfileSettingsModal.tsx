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
    borderRadius: '26px',
    padding: { xs: '16px', sm: '20px', md: '24px', lg: '28px', xl: '32px' },
    width: '100%',
    maxWidth: '400px',
    maxHeight: '90vh',
    margin: { xs: '16px', sm: '32px' },
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
}));

const ProfileImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '200px',
  height: '200px',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('xl')]: {
    width: '180px',
    height: '180px',
  },
  [theme.breakpoints.down('lg')]: {
    width: '160px',
    height: '160px',
  },
  [theme.breakpoints.down('md')]: {
    width: '140px',
    height: '140px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '120px',
    height: '120px',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: '100%',
  fontSize: '72px',
  backgroundColor: '#e0e0e0',
  color: '#666',
  [theme.breakpoints.down('xl')]: {
    fontSize: '64px',
  },
  [theme.breakpoints.down('lg')]: {
    fontSize: '56px',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '48px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '40px',
  },
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '0px',
  backgroundColor: '#FAFBFD',
  borderRadius: '8px',
  marginBottom: "10px",
}));

const Separator = styled(Box)(({ theme }) => ({
  width: '1px',
  height: '20px',
  backgroundColor: '#979797',
  margin: '0 8px',
  [theme.breakpoints.down('md')]: {
    height: '18px',
    margin: '0 6px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '16px',
    margin: '0 4px',
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3EA2FF',
  color: 'white',
  borderRadius: '32px',
  padding: '8px 50px',
  textTransform: 'none',
  fontSize: '15px',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#1976D2',
  },
  '&:disabled': {
    backgroundColor: '#B0BEC5',
    color: 'white',
  },
  [theme.breakpoints.down('lg')]: {
    padding: '11px 44px',
    fontSize: '15px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '10px 40px',
    fontSize: '14px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '9px 36px',
    fontSize: '13px',
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
  const [imageChanged, setImageChanged] = useState(false); // Track if image was changed
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
        setImageChanged(false); // Reset flag when opening modal
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
        setImageChanged(true); // Mark that image was changed
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image delete
  const handleImageDelete = () => {
    setProfileImage(null);
    setImageChanged(true); // Mark that image was changed
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
      // Prepare the request body - only include picture if it was changed
      const requestBody: any = {
        session_id: sessionId,
        name: userName,
      };

      // Only include picture if it was changed and is in base64 format
      if (imageChanged) {
        requestBody.picture = profileImage || '';
      }

      // Call the API
      const response = await editProfile(requestBody).unwrap();

      // Update localStorage with new data
      const updatedUser: User = {
        ...user,
        name: userName,
        ...(imageChanged && { picture: profileImage }), // Only update picture if changed
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Show success message
      setShowSuccess(true);
      setErrorMessage(null);
      setIsEditingName(false);
      setImageChanged(false); // Reset image changed flag

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
            right: { xs: 8, sm: 12, md: 16 },
            top: { xs: 8, sm: 12, md: 16 },
            color: '#D9D9D9',
            zIndex: 1,
            padding: { xs: '4px', sm: '6px', md: '8px' },
          }}
        >
          <CloseIcon sx={{ 
            fontSize: { xs: '20px', sm: '22px', md: '24px' },
          }} />
        </IconButton>

        <DialogContent 
          sx={{ 
            padding: { xs: '16px', sm: '20px', md: '24px', lg: '28px', xl: '32px' },
            mt: 3,
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
          <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: { xs: '10px', sm: '12px', md: '14px', lg: '16px', xl: '20px' },
                color: '#000000',
                mb: { xs: 0.5, sm: 0.75, md: 1 },
                textAlign: 'left',
              }}
            >
              Profile Settings
            </Typography>
            <Typography
              sx={{
                color: '#3EA3FF',
                fontSize: { xs: '08px', sm: '10px', md: '12px', lg: '14px', xl: '16px' },
                fontWeight: 600,
                textAlign: 'left',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
              }}
            >
              {user?.email || ''}
            </Typography>
          </Box>

          {/* User Name Field */}
          <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, mt: "-9px" }}>
            <Typography
              sx={{
                color: '#000000',
                fontWeight: 600,
                fontSize: { xs: '8px', sm: '10px', md: '12px', lg: '14px', xl: '16px' },
                mb: { xs: 0.75, sm: 1 },
                textAlign: 'left',
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
                    sx={{
                      padding: { xs: '4px', sm: '6px', md: '8px' },
                    }}
                  >
                    <EditIcon sx={{ 
                      fontSize: { xs: '16px', sm: '18px', md: '20px' },
                      color: '#666',
                    }} />
                  </IconButton>
                ),
                sx: {
                  fontSize: { xs: '11px', sm: '12px', md: '13px', lg: '13.5px', xl: '14px' },
                  mt: "-6px",
                  color: '#A6A6A6',
                  fontWeight: 400,
                  padding: '4px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#FAFAFA',
                  },
                },
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#A6A6A6',
                  fontWeight: 400,
                  padding: '0',
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#A6A6A6',
                  color: '#A6A6A6',
                },
              }}
            />
          </Box>

          {/* User Profile Image */}
          <Box>
            <Typography
              sx={{
                color: '#000000',
                fontWeight: 600,
                fontSize: { xs: '8px', sm: '10px', md: '12px', lg: '14px', xl: '16px' },
                textAlign: 'left',
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
                    color: '#D5D5D5',
                    '&:hover': {
                      color: '#3EA3FF',
                    },
                  }}
                >
                  <EditIcon sx={{fontSize: "16px"}}/>
                </IconButton>
                <Separator />
                <IconButton
                  size="small"
                  onClick={handleImageDelete}
                  sx={{ 
                    color: '#FF0000',
                    '&:hover': {
                      color: '#D32F2F',
                    },
                  }}
                >
                  <DeleteIcon sx={{ 
                    fontSize: "16px",
                  }} />
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
          }}>
            <SaveButton 
              onClick={handleSave} 
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
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