import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { supabase } from '../utils/supabase';

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
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
          data: {
            nickname: form.nickname,
            interest_categories: selectedCategories,
          },
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
              회원가입
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Winter Log와 함께 성장하세요 🌱
            </Typography>
          </Box>

          {error && <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity='success' sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          <Box component='form' onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='이메일'
              type='email'
              value={form.email}
              onChange={handleChange('email')}
              placeholder='example@winterlog.com'
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label='닉네임'
              value={form.nickname}
              onChange={handleChange('nickname')}
              placeholder='사용할 닉네임을 입력하세요'
              required
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box>
              <TextField
                label='비밀번호'
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder='영문, 숫자, 특수문자 포함 8자 이상'
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
              {form.password && (
                <Box sx={{ mt: 0.75 }}>
                  <LinearProgress
                    variant='determinate'
                    value={passwordStrength.score}
                    color={passwordStrength.color}
                    sx={{ borderRadius: 1, height: 4 }}
                  />
                  <Typography variant='caption' color={`${passwordStrength.color}.main`}>
                    비밀번호 강도: {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>
            <TextField
              label='비밀번호 확인'
              type='password'
              value={form.passwordConfirm}
              onChange={handleChange('passwordConfirm')}
              placeholder='비밀번호를 다시 입력하세요'
              required
              fullWidth
              error={passwordMismatch}
              helperText={
                passwordMatch ? '✔ 비밀번호가 일치합니다'
                  : passwordMismatch ? '❌ 비밀번호가 일치하지 않습니다'
                  : ''
              }
              FormHelperTextProps={{ sx: { color: passwordMatch ? 'success.main' : 'error.main' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                관심 카테고리 (선택)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    onClick={() => toggleCategory(cat)}
                    variant={selectedCategories.includes(cat) ? 'filled' : 'outlined'}
                    size='small'
                    sx={{
                      bgcolor: selectedCategories.includes(cat) ? 'primary.main' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            </Box>

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
              {loading ? <CircularProgress size={20} /> : '회원가입'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              이미 계정이 있으신가요?{' '}
              <Link to='/login' style={{ color: '#CDB4DB', fontWeight: 600, textDecoration: 'none' }}>
                로그인
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPage;
