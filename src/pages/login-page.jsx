import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
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

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FAF9F6 0%, #F3EEFF 50%, #E8F5EE 100%)',
      py: 4,
    }}>
      <Container maxWidth='xs'>
        <Paper elevation={0} sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: '0 8px 40px rgba(205, 180, 219, 0.25)',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              ❄️ Winter Log
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              오늘도 성장하는 중 🌱
            </Typography>
          </Box>

          {error && <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component='form' onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='이메일'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='example@winterlog.com'
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label='비밀번호'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                      {showPassword ? <VisibilityOffIcon fontSize='small' /> : <VisibilityIcon fontSize='small' />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #CDB4DB 0%, #B7E4C7 100%)',
                color: '#4A4A4A',
                '&:hover': { background: 'linear-gradient(135deg, #C0A0D0 0%, #A0D8B0 100%)' },
              }}
            >
              {loading ? <CircularProgress size={20} /> : '로그인'}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }}>또는</Divider>

          <Button
            variant='outlined'
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ py: 1.5, borderRadius: 2, borderColor: 'divider', color: 'text.primary' }}
          >
            Google로 로그인
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              계정이 없으신가요?{' '}
              <Link to='/register' style={{ color: '#CDB4DB', fontWeight: 600, textDecoration: 'none' }}>
                회원가입
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
