'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '@/redux/services/auth/authApi';
import { useUpdateTotalCreditsMutation } from '@/redux/services/credits/credits';
import { resetAllStates } from '@/redux/actions/resetActions'; // ✅ Import centralized reset action
import Cookies from 'js-cookie';
import { ProfileSettingsModal } from './ProfileSettingsModal';

interface User {
  email: string;
  id: string;
  name: string;
  token?: string;
}

interface CurrentProject {
  organization_id: string;
  organization_name: string;
  project_id: string;
  project_name: string;
}

const TopBar: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const isDropdownOpen = Boolean(anchorEl);

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateTotalCredits] = useUpdateTotalCreditsMutation();

  // 🔹 Function to load current project
  const loadCurrentProject = () => {
    const storedProject = localStorage.getItem('currentProject');
    if (storedProject) {
      try {
        setCurrentProject(JSON.parse(storedProject));
      } catch (error) {
        setCurrentProject(null);
      }
    } else {
      setCurrentProject(null);
    }
  };

  // 🔹 Load user + project
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    loadCurrentProject();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentProject' || e.key === null) loadCurrentProject();
    };

    const handleProjectUpdate = () => loadCurrentProject();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projectUpdated', handleProjectUpdate);

    const intervalId = setInterval(() => {
      loadCurrentProject();
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectUpdated', handleProjectUpdate);
      clearInterval(intervalId);
    };
  }, []);

  // 🔹 Fetch credits every 30 seconds
  useEffect(() => {
    const fetchCredits = async () => {
      const session_id = Cookies.get('token');
      if (!session_id) return;

      try {
        const response = await updateTotalCredits({ session_id }).unwrap();
        setCredits(response.total_credits);
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits(); // Initial call

    const interval = setInterval(fetchCredits, 30000); // Every 30s
    return () => clearInterval(interval);
  }, [updateTotalCredits]);

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleChoosePlan = () => {
    handleDropdownClose();
    router.push('/plans');
  };

  const handleSettings = () => {
    handleDropdownClose();
    setProfileSettingsOpen(true);
  };

  const handleProfileSettingsClose = () => {
    setProfileSettingsOpen(false);
    // Refresh user data after modal closes
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const handleLogout = async () => {
    handleDropdownClose();

    const token = Cookies.get('token');

    if (!token) {
      // ✅ Reset all Redux states and disconnect WebSocket
      dispatch(resetAllStates() as any);
      
      localStorage.clear();
      Cookies.remove('token');
      router.push('/');
      return;
    }

    try {
      const response = await logout({ token }).unwrap();
      console.log('Logout successful:', response.message);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // ✅ Reset all Redux states and disconnect WebSocket
      dispatch(resetAllStates() as any);
      
      // Clear local storage and cookies
      localStorage.removeItem('user');
      localStorage.removeItem('currentProject');
      Cookies.remove('token');
      
      // Navigate to login
      router.push('/');
    }
  };

  const getInitials = (name: string): string =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  if (!user) return null;

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#FFF',
          borderBottom: '1px solid #D2D2D2',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          {/* Left side - Project Name */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {currentProject?.project_name ? (
              <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
                {currentProject.project_name}
              </Typography>
            ) : (
              <Typography
                variant="h6"
                sx={{
                  color: '#999',
                  fontWeight: 500,
                  fontStyle: 'italic',
                }}
              >
                No project selected
              </Typography>
            )}
          </Box>

          {/* Right side - User Info and Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getInitials(user.name)}
            </Avatar>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="body2"
                sx={{ color: '#000', fontWeight: 500, lineHeight: 1.2 }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#666', lineHeight: 1.2 }}
              >
                {credits !== null ? `${credits} Credits` : 'Loading...'}
              </Typography>
            </Box>

            <IconButton
              onClick={handleDropdownOpen}
              size="small"
              sx={{
                transition: 'all 0.2s',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              }}
            >
              <KeyboardArrowDownIcon
                sx={{
                  color: '#666',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={isDropdownOpen}
              onClose={handleDropdownClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  minWidth: 180,
                  borderRadius: 2,
                  border: '1px solid #D2D2D2',
                  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)',
                },
              }}
            >
              <MenuItem onClick={handleChoosePlan}>
                <ListItemIcon>
                  <CreditCardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Choose plan</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                sx={{
                  color: '#d32f2f',
                  '& .MuiListItemIcon-root': {
                    color: '#d32f2f',
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        open={profileSettingsOpen}
        onClose={handleProfileSettingsClose}
      />
    </>
  );
};

export default TopBar;