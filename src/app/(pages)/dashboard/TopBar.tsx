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
import { useLogoutMutation } from '@/redux/services/auth/authApi';
import Cookies from 'js-cookie';

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
  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDropdownOpen = Boolean(anchorEl);

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Function to load current project
  const loadCurrentProject = () => {
    const storedProject = localStorage.getItem('currentProject');
    if (storedProject) {
      try {
        const projectData = JSON.parse(storedProject);
        setCurrentProject(projectData);
      } catch (error) {
        console.error('Error parsing project data:', error);
        setCurrentProject(null);
      }
    } else {
      setCurrentProject(null);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Load project on mount
    loadCurrentProject();

    // Listen for storage changes (when project is created/updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentProject' || e.key === null) {
        loadCurrentProject();
      }
    };

    // Custom event listener for same-tab updates
    const handleProjectUpdate = () => {
      loadCurrentProject();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projectUpdated', handleProjectUpdate);

    // Poll for changes every 500ms as a fallback
    const intervalId = setInterval(() => {
      loadCurrentProject();
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectUpdated', handleProjectUpdate);
      clearInterval(intervalId);
    };
  }, []);

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
    router.push('/settings');
  };

  const handleLogout = async () => {
    handleDropdownClose();

    const token = Cookies.get("token");

    if (!token) {
      console.warn('No token found for logout');
      localStorage.clear();
      Cookies.remove("token");
      router.push('/');
      return;
    }

    try {
      const response = await logout({ token }).unwrap();
      console.log('Logout successful:', response.message);

      localStorage.removeItem('user');
      localStorage.removeItem('currentProject');
      Cookies.remove("token");
      router.push('/');
    } catch (error: any) {
      console.error('Logout failed:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('currentProject');
      Cookies.remove("token");
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
            <Typography
              variant="h6"
              sx={{
                color: '#000',
                fontWeight: 600,
              }}
            >
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
              sx={{
                color: '#000',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                lineHeight: 1.2,
              }}
            >
              100 Credits
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
  );
};

export default TopBar;