import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import useMediaQuery from '@mui/material/useMediaQuery';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AuthLeftPanel from '../components/landing/auth-left-panel';
import bunnyImg from '../assets/bunny.png';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const CATEGORIES = ['프론트엔드', 'JavaScript', 'React', 'AI 활용', '오류 해결 기록', '포트폴리오 피드백', '일상 공부 기록'];

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'inherit' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 25, label: '약함', color: 'error' };
  if (score <= 2) return { score: 50, label: '보통', color: 'warning' };
  if (score <= 3) return { score: 75, label: '안전함', color: 'success' };
  return { score: 100, label: '매우 안전', color: 'success' };
};

function RegisterPage() {
  const { themeMode } = useAuthStore();
  const isDark = themeMode === 'dark';
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const isSmall = useMediaQuery('(max-width:700px)');

  const passwordStrength = getPasswordStrength(form.password);
  const passwordMatch = form.passwordConfirm && form.password === form.passwordConfirm;
  const passwordMismatch = form.passwordConfirm && form.password !== form.passwordConfirm;

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleCategory = (cat) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordMismatch) return setError('비밀번호가 일치하지 않습니다.');
    if (form.password.length < 8) return setError('비밀번호는 8자 이상이어야 합니다.');
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { nickname: form.nickname, interest_categories: selectedCategories },
        },
      });
      if (authError) throw authError;
      setSuccess('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: isDark ? '#FFFFFF' : '#FAFAFE',
      '& fieldset': { borderColor: isDark ? '#B9A7E6' : undefined },
      '&:hover fieldset': { borderColor: isDark ? '#9B7FD4' : undefined },
    },
    '& .MuiInputBase-input': {
      color: isDark ? '#2A1B4A' : undefined,
      '&::placeholder': {
        color: isDark ? '#9B8FC0' : '#C4BCD9',
        opacity: 1,
      },
    },
  };

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
        {/* 왼쪽 공통 일러스트 패널 (로그인 페이지와 동일) */}
        {!isSmall && <AuthLeftPanel />}

        {/* 오른쪽 회원가입 폼 */}
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
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Box component='img' src={bunnyImg} alt='마스코트'
                sx={{ width: 68, height: 68, objectFit: 'contain' }} />
            </Box>
          )}

          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1.5, fontSize: '1.3rem' }}>
            회원가입
          </Typography>

          {error && <Alert severity='error' sx={{ mb: 1.25, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity='success' sx={{ mb: 1.25, borderRadius: 2 }}>{success}</Alert>}

          <Box component='form' onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>이메일</Typography>
              <TextField type='email' value={form.email} onChange={handleChange('email')}
                placeholder='이메일을 입력하세요' required fullWidth size='small' sx={inputSx} />
            </Box>

            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>닉네임</Typography>
              <TextField value={form.nickname} onChange={handleChange('nickname')}
                placeholder='사용할 닉네임을 입력하세요' required fullWidth size='small' sx={inputSx} />
            </Box>

            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>비밀번호</Typography>
              <TextField
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder='영문, 숫자, 특수문자 포함 8자 이상'
                required fullWidth size='small'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} size='small' edge='end'>
                        {showPassword
                          ? <VisibilityOffIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                          : <VisibilityIcon sx={{ fontSize: 17, color: 'text.disabled' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
              {form.password && (
                <Box sx={{ mt: 0.75 }}>
                  <LinearProgress variant='determinate' value={passwordStrength.score}
                    color={passwordStrength.color} sx={{ borderRadius: 1, height: 3 }} />
                  <Typography variant='caption' color={`${passwordStrength.color}.main`}>
                    강도: {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>비밀번호 확인</Typography>
              <TextField
                type='password' value={form.passwordConfirm}
                onChange={handleChange('passwordConfirm')}
                placeholder='비밀번호를 다시 입력하세요'
                required fullWidth size='small'
                error={passwordMismatch}
                helperText={
                  passwordMatch ? '✔ 비밀번호가 일치합니다'
                    : passwordMismatch ? '❌ 비밀번호가 일치하지 않습니다' : ''
                }
                FormHelperTextProps={{ sx: { color: passwordMatch ? 'success.main' : 'error.main', mt: 0.5 } }}
                sx={inputSx}
              />
            </Box>

            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.75, display: 'block' }}>
                관심 카테고리 <Typography component='span' variant='caption' color='text.disabled'>(선택)</Typography>
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {CATEGORIES.map((cat) => (
                  <Chip key={cat} label={cat} onClick={() => toggleCategory(cat)}
                    size='small'
                    variant={selectedCategories.includes(cat) ? 'filled' : 'outlined'}
                    sx={{
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      bgcolor: selectedCategories.includes(cat) ? '#EED8FF' : 'transparent',
                      color: selectedCategories.includes(cat) ? '#6030A8' : 'text.secondary',
                      borderColor: selectedCategories.includes(cat) ? '#C8A8F0' : 'divider',
                      '&:hover': { bgcolor: selectedCategories.includes(cat) ? '#E4C8FF' : 'rgba(200,180,255,0.12)' },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Button type='submit' variant='contained' fullWidth disabled={loading}
              sx={{
                mt: 0.5, py: 1.25, borderRadius: 3, fontSize: '0.95rem',
                bgcolor: '#A898D8', color: '#fff', boxShadow: 'none',
                '&:hover': { bgcolor: '#9888C8', boxShadow: 'none' },
              }}>
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : '회원가입'}
            </Button>
          </Box>

          <Typography variant='body2' color='text.disabled' sx={{ textAlign: 'center', mt: 1.5, fontSize: '0.8rem' }}>
            이미 계정이 있으신가요?{' '}
            <Link to='/login' style={{ color: '#9B82CC', fontWeight: 600, textDecoration: 'none' }}>
              로그인
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
