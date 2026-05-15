import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const EMOJIS = ['🌱', '☁️', '🌙', '✨', '💜', '☕', '🐰'];

const SUPPORT_MESSAGES = {
  1: '따뜻한 마음이 전해져요 ☁️',
  2: '포근한 응원 감사합니다 🌱',
  3: '별빛 같은 응원이 도착했어요 ✨',
  4: '마음이 따뜻해지는 응원이에요 💜',
  5: '온 마음을 다한 응원 감사합니다 🌙',
};

const GUESTBOOK_PER_PAGE = 5;

/**
 * StarRating 컴포넌트
 *
 * Props:
 * @param {number} value - 현재 선택된 별 수 [Required]
 * @param {function} onChange - 별 선택 시 호출 [Optional]
 * @param {boolean} readOnly - 읽기 전용 여부 [Optional, 기본값: false]
 */
function StarRating({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          sx={{
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: readOnly ? '0.9rem' : '1.65rem',
            transition: 'transform 0.12s, filter 0.12s',
            userSelect: 'none',
            lineHeight: 1,
            transform: display >= star ? 'scale(1.18)' : 'scale(1)',
            filter: display >= star
              ? 'drop-shadow(0 0 5px rgba(255, 210, 50, 0.85))'
              : 'grayscale(1) opacity(0.3)',
          }}
        >
          ⭐
        </Box>
      ))}
    </Box>
  );
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}시간 전`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)}일 전`;
  return date.toLocaleDateString('ko-KR');
};

function GuestbookPage() {
  const { user, profile } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('🌱');
  const [stars, setStars] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const totalPages = Math.ceil(totalCount / GUESTBOOK_PER_PAGE);

  useEffect(() => {
    fetchEntries(1);
  }, []);

  const fetchEntries = async (currentPage) => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * GUESTBOOK_PER_PAGE;
      const to = currentPage * GUESTBOOK_PER_PAGE - 1;

      const [{ count }, { data }] = await Promise.all([
        supabase.from('winterlog_guestbook').select('*', { count: 'exact', head: true }),
        supabase.from('winterlog_guestbook')
          .select('*, winterlog_users(nickname, profile_image)')
          .order('created_at', { ascending: false })
          .range(from, to),
      ]);
      setEntries(data || []);
      setTotalCount(count || 0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchEntries(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { error: err } = await supabase
        .from('winterlog_guestbook')
        .insert({
          user_id: user.id,
          nickname: profile?.nickname || user.email,
          message: message.trim(),
          emoji,
          support_stars: stars,
        });
      if (err) throw err;
      setSuccess(SUPPORT_MESSAGES[stars]);
      setMessage('');
      setEmoji('🌱');
      setStars(3);
      setPage(1);
      fetchEntries(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pageBtnSx = (isActive) => ({
    minWidth: 36,
    height: 36,
    p: 0,
    borderRadius: '999px',
    border: '1px solid',
    borderColor: isActive ? '#CDB4DB' : '#D8C7F0',
    bgcolor: isActive ? '#CDB4DB' : 'transparent',
    color: isActive ? '#FFFFFF' : 'text.secondary',
    fontSize: '0.85rem',
    fontWeight: isActive ? 600 : 400,
    '&:hover': { bgcolor: isActive ? '#BFA8CF' : '#F1E6FF', borderColor: isActive ? '#BFA8CF' : '#C8A8F0' },
  });

  return (
    <Container maxWidth='md' sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, md: 3 } }}>
      {/* 페이지 헤더 */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          ✉️ 방명록
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Winter Log에 따뜻한 응원 메시지를 남겨주세요 🌱
        </Typography>
      </Box>

      {/* 작성 폼 */}
      {user ? (
        <Paper elevation={0} sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(248,236,255,0.9) 0%, rgba(232,220,255,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(200,175,245,0.4)',
        }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#5828A0', mb: 2 }}>
            응원 메시지 남기기
          </Typography>

          {success && (
            <Alert severity='success' sx={{ mb: 2, borderRadius: 2, bgcolor: 'rgba(255,248,230,0.92)', color: '#5028A0', border: '1px solid rgba(200,175,245,0.5)' }}>
              {success}
            </Alert>
          )}
          {error && <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component='form' onSubmit={handleSubmit}>
            {/* 이모지 선택 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, display: 'block' }}>
                오늘의 기분 이모지
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {EMOJIS.map((e) => (
                  <Box
                    key={e}
                    onClick={() => setEmoji(e)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: emoji === e ? '#9060C8' : 'transparent',
                      bgcolor: emoji === e ? 'rgba(180,140,255,0.2)' : 'rgba(200,180,240,0.1)',
                      transition: 'all 0.12s',
                      userSelect: 'none',
                      '&:hover': { bgcolor: 'rgba(180,140,255,0.22)', transform: 'scale(1.1)' },
                    }}
                  >
                    {e}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 응원 온도 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, mb: 1, display: 'block' }}>
                ⭐ 응원 온도
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <StarRating value={stars} onChange={setStars} />
                {stars > 0 && (
                  <Typography variant='caption' sx={{ color: '#8048C0', fontStyle: 'italic' }}>
                    {SUPPORT_MESSAGES[stars]}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* 메시지 입력 */}
            <TextField
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='따뜻한 응원 메시지를 남겨주세요... (최대 300자)'
              fullWidth
              size='small'
              inputProps={{ maxLength: 300 }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.72)' },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='caption' color='text.disabled'>{message.length}/300</Typography>
              <Button
                type='submit'
                variant='contained'
                size='small'
                disabled={submitting || !message.trim()}
                sx={{
                  bgcolor: '#EDD5FF',
                  color: '#6030A8',
                  borderRadius: 3,
                  px: 2.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#E0C0FF', boxShadow: 'none' },
                  '&:disabled': { bgcolor: 'rgba(200,180,240,0.3)', color: 'rgba(96,48,168,0.4)' },
                }}
              >
                {submitting ? <CircularProgress size={16} sx={{ color: '#9060C8' }} /> : '방명록 남기기 🌱'}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant='body2' color='text.secondary'>
            방명록을 작성하려면{' '}
            <Typography component={Link} to='/login' variant='body2' sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
              로그인
            </Typography>
            이 필요합니다.
          </Typography>
        </Paper>
      )}

      {/* 방명록 목록 */}
      <Typography variant='subtitle2' sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
        총 {totalCount}개의 응원
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : entries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>✉️</Typography>
          <Typography variant='body2' color='text.secondary'>
            아직 방명록이 없어요. 첫 번째 응원을 남겨보세요!
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {entries.map((entry) => (
              <Paper key={entry.guestbook_id} elevation={0} sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'box-shadow 0.15s',
                '&:hover': { boxShadow: '0 4px 16px rgba(155, 100, 220, 0.12)' },
              }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Typography sx={{ fontSize: '1.9rem', lineHeight: 1, flexShrink: 0, mt: 0.25 }}>
                    {entry.emoji}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.main', fontSize: '0.65rem' }}>
                          {entry.winterlog_users?.nickname?.[0] || '?'}
                        </Avatar>
                        <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {entry.winterlog_users?.nickname || entry.nickname}
                        </Typography>
                      </Box>
                      <StarRating value={entry.support_stars} readOnly />
                    </Box>
                    <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.65, fontSize: '0.85rem', wordBreak: 'break-word' }}>
                      {entry.message}
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5, display: 'block' }}>
                      {formatDate(entry.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.75, mt: 3 }}>
              <Button
                size='small'
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                sx={{ px: 1.75, height: 36, borderRadius: '999px', border: '1px solid #D8C7F0', color: 'text.secondary', fontSize: '0.8rem', '&:hover': { bgcolor: '#F1E6FF', borderColor: '#C8A8F0' }, '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' } }}
              >이전</Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} size='small' onClick={() => handlePageChange(p)} sx={pageBtnSx(page === p)}>
                  {p}
                </Button>
              ))}

              <Button
                size='small'
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                sx={{ px: 1.75, height: 36, borderRadius: '999px', border: '1px solid #D8C7F0', color: 'text.secondary', fontSize: '0.8rem', '&:hover': { bgcolor: '#F1E6FF', borderColor: '#C8A8F0' }, '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' } }}
              >다음</Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default GuestbookPage;
