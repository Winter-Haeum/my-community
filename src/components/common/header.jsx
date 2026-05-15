import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../../utils/supabase';
import useAuthStore from '../../store/auth-store';

function Header() {
  const { user, profile, themeMode, toggleTheme, signOut } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <AppBar position='sticky' elevation={0} sx={{
      bgcolor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}>
      <Toolbar sx={{ gap: 2, px: { xs: 2, md: 3 }, minHeight: { xs: 56, md: 64 } }}>
        <Typography
          component={Link}
          to='/'
          variant='h6'
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: { xs: '1.05rem', md: '1.25rem' },
            whiteSpace: 'nowrap',
          }}
        >
          ❄️ Winter Log
        </Typography>

        <Box sx={{
          flex: 1,
          maxWidth: 380,
          mx: { xs: 1, md: 2 },
          bgcolor: 'background.default',
          borderRadius: 3,
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
          <InputBase
            placeholder='검색...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
        </Box>

        <Box sx={{ flex: 1 }} />

        <IconButton onClick={toggleTheme} size='small'>
          {themeMode === 'dark' ? <LightModeIcon fontSize='small' /> : <DarkModeIcon fontSize='small' />}
        </IconButton>

        {user && (
          <Button
            variant='contained'
            size='small'
            startIcon={<EditIcon />}
            component={Link}
            to='/write'
            sx={{ bgcolor: 'primary.main', color: 'text.primary', display: { xs: 'none', sm: 'flex' } }}
          >
            글쓰기
          </Button>
        )}

        {user ? (
          <>
            <IconButton onClick={handleMenuOpen} size='small' sx={{ p: 0.5 }}>
              <Avatar
                src={profile?.profile_image}
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}
              >
                {profile?.nickname?.[0] || user?.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
              PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}>
              <MenuItem component={Link} to='/my' onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>마이페이지</MenuItem>
              <MenuItem component={Link} to='/write' onClick={handleMenuClose} sx={{ fontSize: '0.875rem' }}>글쓰기</MenuItem>
              <MenuItem onClick={handleSignOut} sx={{ fontSize: '0.875rem', color: 'error.main' }}>로그아웃</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} to='/login' size='small' sx={{ color: 'text.secondary' }}>로그인</Button>
            <Button
              component={Link}
              to='/register'
              variant='contained'
              size='small'
              sx={{ bgcolor: 'primary.main', color: 'text.primary' }}
            >
              회원가입
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
