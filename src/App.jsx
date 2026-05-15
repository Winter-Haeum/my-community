import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { getTheme } from './theme';
import useAuthStore from './store/auth-store';
import { useAuth } from './hooks/use-auth';
import Header from './components/common/header';
import LoginPage from './pages/login-page';
import RegisterPage from './pages/register-page';
import PostListPage from './pages/post-list-page';
import PostDetailPage from './pages/post-detail-page';
import PostWritePage from './pages/post-write-page';
import MyPage from './pages/my-page';

function AppRoutes() {
  useAuth();
  const { user } = useAuthStore();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Routes>
          <Route path='/' element={<PostListPage />} />
          <Route path='/login' element={user ? <Navigate to='/' replace /> : <LoginPage />} />
          <Route path='/register' element={user ? <Navigate to='/' replace /> : <RegisterPage />} />
          <Route path='/post/:id' element={<PostDetailPage />} />
          <Route path='/write' element={user ? <PostWritePage /> : <Navigate to='/login' replace />} />
          <Route path='/my' element={user ? <MyPage /> : <Navigate to='/login' replace />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  const { themeMode } = useAuthStore();
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
