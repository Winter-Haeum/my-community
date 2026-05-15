import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import useMediaQuery from '@mui/material/useMediaQuery';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import AuthLeftPanel from '../components/landing/auth-left-panel';
import bunnyImg from '../assets/bunny.png';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const isSmall = useMediaQuery('(max-width:700px)');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      setUser(data.user);
      const { data: profile } = await supabase
        .from('winterlog_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      setProfile(profile);
      navigate('/');
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FAFAFE' } };

  return (
    <Box sx={{
      height: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 1.5, md: 2 },
    }}>
      <Paper elevation={0} sx={{
        display: 'flex',
        width: '100%',
        maxWidth: 820,
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(100, 60, 180, 0.22)',
      }}>
        {/* 왼쪽 공통 일러스트 패널 */}
        {!isSmall && <AuthLeftPanel />}

        {/* 오른쪽 로그인 폼 */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, md: 3.5 },
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}>
          {/* 모바일 토끼 */}
          {isSmall && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box component='img' src={bunnyImg} alt='마스코트'
                sx={{ width: 72, height: 72, objectFit: 'contain' }} />
            </Box>
          )}

          <Typography variant='h5' sx={{ fontWeight: 700, mb: 2, color: 'text.primary', fontSize: '1.4rem' }}>
            로그인
          </Typography>

          {error && (
            <Alert severity='error' sx={{ mb: 1.5, borderRadius: 2, border: '1px solid #FFCDD2' }}>
              {error}
            </Alert>
          )}

          <Box component='form' onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>
                이메일
              </Typography>
              <TextField
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='이메일을 입력하세요'
                required fullWidth size='small'
                sx={inputSx}
              />
            </Box>

            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>
                비밀번호
              </Typography>
              <TextField
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='비밀번호를 입력하세요'
                required fullWidth size='small'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} size='small' edge='end'>
                        {showPassword
                          ? <VisibilityOffIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                          : <VisibilityIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>

            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{
                mt: 0.5, py: 1.25, borderRadius: 3, fontSize: '0.95rem',
                bgcolor: '#A898D8', color: '#fff',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#9888C8', boxShadow: 'none' },
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : '로그인'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 1.5 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant='caption' sx={{ px: 1.5, color: 'text.disabled' }}>또는</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Button
            variant='outlined'
            fullWidth
            startIcon={<GoogleIcon sx={{ fontSize: 18 }} />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1.1, borderRadius: 3,
              borderColor: 'divider', color: 'text.secondary', fontSize: '0.875rem',
              '&:hover': { borderColor: 'primary.light', bgcolor: '#F8F4FF' },
            }}
          >
            Google로 로그인
          </Button>

          <Typography variant='body2' color='text.disabled' sx={{ textAlign: 'center', mt: 1.5, fontSize: '0.8rem' }}>
            계정이 없으신가요?{' '}
            <Link to='/register' style={{ color: '#9B82CC', fontWeight: 600, textDecoration: 'none' }}>
              회원가입
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;
