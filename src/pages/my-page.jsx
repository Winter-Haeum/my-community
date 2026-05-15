import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const INTEREST_CATEGORIES = [
  '프론트엔드', 'JavaScript', 'React', 'AI 활용',
  '오류 해결 기록', '포트폴리오 피드백', '일상 공부 기록',
];

const getMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month, i + 1).toISOString().split('T')[0]
  );
};

const STATUS_COLORS = { todo: 'default', progress: 'warning', done: 'success' };
const STATUS_LABELS = { todo: '대기', progress: '진행중', done: '완료' };
const TODO_STATUS_NEXT = { todo: 'progress', progress: 'done', done: 'todo' };

function MyPage() {
  const { user, profile, setProfile } = useAuthStore();
  const fileInputRef = useRef(null);

  const [studyLogs, setStudyLogs] = useState([]);
  const [todos, setTodos] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [todayGoal, setTodayGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [editGoal, setEditGoal] = useState(false);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ nickname: '', bio: '', interest_categories: [] });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const monthDates = getMonthDates();

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [logsRes, todosRes, postsRes, todayLogRes] = await Promise.all([
      supabase.from('winterlog_study_logs').select('study_date').eq('user_id', user.id),
      supabase.from('winterlog_todos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('winterlog_posts').select('post_id, title, created_at, like_count, category')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('winterlog_study_logs').select('goal').eq('user_id', user.id).eq('study_date', today).single(),
    ]);
    setStudyLogs(logsRes.data?.map((l) => l.study_date) || []);
    setTodos(todosRes.data || []);
    setRecentPosts(postsRes.data || []);
    setTodayGoal(todayLogRes.data?.goal || '');
    setLoading(false);
  };

  /* ─── 프로필 수정 ─── */
  const handleStartEdit = () => {
    setProfileForm({
      nickname: profile?.nickname || '',
      bio: profile?.bio || '',
      interest_categories: profile?.interest_categories || [],
    });
    setAvatarPreview(null);
    setAvatarFile(null);
    setProfileError('');
    setEditProfile(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleInterest = (cat) =>
    setProfileForm((prev) => ({
      ...prev,
      interest_categories: prev.interest_categories.includes(cat)
        ? prev.interest_categories.filter((c) => c !== cat)
        : [...prev.interest_categories, cat],
    }));

  const handleSaveProfile = async () => {
    if (!profileForm.nickname.trim()) { setProfileError('닉네임을 입력해주세요.'); return; }
    setProfileSaving(true);
    setProfileError('');
    try {
      let imageUrl = profile?.profile_image || null;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('avatars').upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
        imageUrl = `${publicUrl}?t=${Date.now()}`;
      }

      const { error: dbErr } = await supabase.from('winterlog_users').update({
        nickname: profileForm.nickname.trim(),
        bio: profileForm.bio.trim(),
        interest_categories: profileForm.interest_categories,
        profile_image: imageUrl,
      }).eq('user_id', user.id);
      if (dbErr) throw dbErr;

      setProfile({
        ...profile,
        nickname: profileForm.nickname.trim(),
        bio: profileForm.bio.trim(),
        interest_categories: profileForm.interest_categories,
        profile_image: imageUrl,
      });
      setEditProfile(false);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  /* ─── 할 일 ─── */
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    const { data } = await supabase
      .from('winterlog_todos').insert({ user_id: user.id, title: newTodo, status: 'todo' })
      .select().single();
    setTodos((prev) => [data, ...prev]);
    setNewTodo('');
  };

  const handleTodoStatus = async (todo) => {
    const next = TODO_STATUS_NEXT[todo.status];
    await supabase.from('winterlog_todos')
      .update({ status: next, completed_at: next === 'done' ? new Date().toISOString() : null })
      .eq('todo_id', todo.todo_id);
    setTodos((prev) => prev.map((t) => t.todo_id === todo.todo_id ? { ...t, status: next } : t));
    if (next === 'done' && profile) {
      const score = (profile.activity_score || 0) + 3;
      await supabase.from('winterlog_users').update({ activity_score: score }).eq('user_id', user.id);
      setProfile({ ...profile, activity_score: score });
    }
  };

  const handleDeleteTodo = async (id) => {
    await supabase.from('winterlog_todos').delete().eq('todo_id', id);
    setTodos((prev) => prev.filter((t) => t.todo_id !== id));
  };

  /* ─── 오늘의 목표 ─── */
  const handleSaveGoal = async () => {
    const { data: existing } = await supabase.from('winterlog_study_logs')
      .select('log_id').eq('user_id', user.id).eq('study_date', today).single();
    if (existing) {
      await supabase.from('winterlog_study_logs').update({ goal: todayGoal }).eq('log_id', existing.log_id);
    } else {
      await supabase.from('winterlog_study_logs').insert({ user_id: user.id, study_date: today, goal: todayGoal });
      setStudyLogs((prev) => [...prev, today]);
    }
    setEditGoal(false);
  };

  const todoStats = {
    total: todos.length,
    progress: todos.filter((t) => t.status === 'progress').length,
    done: todos.filter((t) => t.status === 'done').length,
  };

  const currentAvatar = avatarPreview || profile?.profile_image || null;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={3} alignItems='flex-start'>

        {/* ══════════════════════════════
            왼쪽: 프로필 + 최근 게시글
        ══════════════════════════════ */}
        <Grid size={{ xs: 12, md: 4 }}>

          {/* 프로필 카드 */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>
            {!editProfile ? (
              /* ── 프로필 뷰 ── */
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={profile?.profile_image || undefined}
                  sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: '2.2rem', mx: 'auto', mb: 2, boxShadow: '0 4px 16px rgba(168,152,216,0.35)' }}
                >
                  {!profile?.profile_image && (profile?.nickname?.[0] || user?.email?.[0]?.toUpperCase())}
                </Avatar>

                <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                  {profile?.nickname || '닉네임 없음'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2, minHeight: 20, lineHeight: 1.5 }}>
                  {profile?.bio || '자기소개가 없습니다'}
                </Typography>

                {profile?.interest_categories?.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mb: 2.5 }}>
                    {profile.interest_categories.map((cat) => (
                      <Chip key={cat} label={cat} size='small'
                        sx={{ fontSize: '0.68rem', bgcolor: '#EED8FF', color: '#6030A8', border: '1px solid #C8A8F0' }} />
                    ))}
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5, mb: 2.5 }}>
                  <Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
                      {profile?.activity_score || 0}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>활동 점수</Typography>
                  </Box>
                  <Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: 'secondary.main', lineHeight: 1.2 }}>
                      {studyLogs.length}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>공부 일수</Typography>
                  </Box>
                </Box>

                <Button
                  startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                  size='small' onClick={handleStartEdit}
                  sx={{ color: 'text.secondary', fontSize: '0.78rem', borderRadius: 2 }}
                >
                  프로필 수정
                </Button>
              </Box>
            ) : (
              /* ── 프로필 수정 폼 ── */
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 2 }}>프로필 수정</Typography>

                {/* 프로필 이미지 변경 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                    <Avatar
                      src={currentAvatar || undefined}
                      sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
                    >
                      {!currentAvatar && (profileForm.nickname?.[0] || user?.email?.[0]?.toUpperCase())}
                    </Avatar>
                    <Box sx={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      bgcolor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.15s',
                      '&:hover': { opacity: 1 },
                    }}>
                      <CameraAltIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                  </Box>
                  <input ref={fileInputRef} type='file' accept='image/*' hidden onChange={handleAvatarChange} />
                </Box>
                <Typography variant='caption' color='text.disabled' sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                  이미지를 클릭하여 변경 (최대 2MB)
                </Typography>

                {profileError && <Alert severity='error' sx={{ mb: 1.5, py: 0.5, borderRadius: 2 }}>{profileError}</Alert>}

                {/* 닉네임 */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>닉네임</Typography>
                  <TextField size='small' fullWidth value={profileForm.nickname}
                    onChange={(e) => setProfileForm((p) => ({ ...p, nickname: e.target.value }))}
                    placeholder='닉네임' sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Box>

                {/* 자기소개 */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>자기소개</Typography>
                  <TextField size='small' fullWidth multiline rows={2} value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder='간단한 자기소개' sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Box>

                {/* 관심 카테고리 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>관심 카테고리</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {INTEREST_CATEGORIES.map((cat) => (
                      <FormControlLabel key={cat}
                        control={
                          <Checkbox
                            checked={profileForm.interest_categories.includes(cat)}
                            onChange={() => toggleInterest(cat)}
                            size='small'
                            sx={{ py: 0.25, color: '#C8A8F0', '&.Mui-checked': { color: '#A898D8' } }}
                          />
                        }
                        label={<Typography variant='body2' sx={{ fontSize: '0.82rem' }}>{cat}</Typography>}
                        sx={{ mx: 0, my: 0 }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant='outlined' size='small' fullWidth onClick={() => setEditProfile(false)} sx={{ borderRadius: 2 }}>
                    취소
                  </Button>
                  <Button variant='contained' size='small' fullWidth onClick={handleSaveProfile} disabled={profileSaving}
                    sx={{ bgcolor: '#A898D8', color: '#fff', borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#9888C8', boxShadow: 'none' } }}>
                    {profileSaving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : '저장'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>

          {/* 최근 작성 게시글 */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>📝 최근 작성 게시글</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {recentPosts.length === 0 ? (
                <Typography variant='body2' color='text.disabled' sx={{ textAlign: 'center', py: 3, fontSize: '0.85rem' }}>
                  아직 작성한 게시글이 없습니다
                </Typography>
              ) : recentPosts.map((post) => (
                <Box key={post.post_id} component={Link} to={`/post/${post.post_id}`}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    p: 1.25, borderRadius: 2, textDecoration: 'none',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'primary.main' },
                    transition: 'background-color 0.15s',
                  }}>
                  <Typography variant='body2' color='text.primary'
                    sx={{ flex: 1, fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </Typography>
                  <Typography variant='caption' color='text.disabled' sx={{ flexShrink: 0, fontSize: '0.72rem' }}>
                    ❤️ {post.like_count || 0}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* ══════════════════════════════
            오른쪽: 잔디 → 목표 → 할 일
        ══════════════════════════════ */}
        <Grid size={{ xs: 12, md: 8 }}>

          {/* 공부 잔디 */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>🌿 이번달 공부 잔디</Typography>
                <Typography variant='caption' color='text.disabled'>게시글·댓글 작성일 기준</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant='body2' sx={{ fontWeight: 600 }}>{studyLogs.length}일 활동</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {monthDates.map((date) => (
                <Tooltip key={date} title={date} placement='top'>
                  <Box sx={{
                    width: 20, height: 20, borderRadius: 0.75,
                    bgcolor: studyLogs.includes(date)
                      ? (date === today ? 'primary.main' : '#B7E4C7')
                      : 'background.default',
                    border: '1px solid',
                    borderColor: date === today ? 'primary.main' : 'divider',
                    cursor: 'default',
                    transition: 'transform 0.1s',
                    '&:hover': { transform: 'scale(1.3)' },
                  }} />
                </Tooltip>
              ))}
            </Box>
          </Paper>

          {/* 오늘의 목표 */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>🎯 오늘의 목표</Typography>
              <Button size='small' onClick={() => setEditGoal(!editGoal)} sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                {editGoal ? '취소' : '수정'}
              </Button>
            </Box>
            {editGoal ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size='small' fullWidth value={todayGoal}
                  onChange={(e) => setTodayGoal(e.target.value)}
                  placeholder='오늘의 공부 목표를 입력하세요'
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()} />
                <Button variant='contained' size='small' onClick={handleSaveGoal}
                  sx={{ bgcolor: 'primary.main', color: 'text.primary', flexShrink: 0 }}>저장</Button>
              </Box>
            ) : (
              <Typography variant='body1'
                sx={{ color: todayGoal ? 'text.primary' : 'text.disabled', fontStyle: todayGoal ? 'normal' : 'italic' }}>
                {todayGoal || '오늘의 목표를 설정해보세요 💪'}
              </Typography>
            )}
          </Paper>

          {/* 오늘 할 일 */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1.5 }}>📋 오늘 할 일</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
              <Typography variant='caption' color='text.secondary'>전체 {todoStats.total}</Typography>
              <Typography variant='caption' color='warning.main'>진행중 {todoStats.progress}</Typography>
              <Typography variant='caption' color='success.main'>완료 {todoStats.done}</Typography>
            </Box>

            {todoStats.total > 0 && (
              <LinearProgress variant='determinate' value={(todoStats.done / todoStats.total) * 100}
                color='success' sx={{ mb: 2, borderRadius: 1, height: 5 }} />
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField size='small' fullWidth value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder='할 일을 입력하세요'
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()} />
              <IconButton onClick={handleAddTodo}
                sx={{ bgcolor: 'primary.main', borderRadius: 1.5, '&:hover': { bgcolor: '#C0A0D0' } }}>
                <AddIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 320, overflowY: 'auto' }}>
              {todos.map((todo) => (
                <Box key={todo.todo_id} sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  p: 1.25, bgcolor: 'background.default', borderRadius: 2,
                  opacity: todo.status === 'done' ? 0.6 : 1,
                }}>
                  <IconButton size='small' onClick={() => handleTodoStatus(todo)} sx={{
                    p: 0.25, borderRadius: 1,
                    bgcolor: todo.status === 'done' ? 'success.main' : todo.status === 'progress' ? 'warning.main' : 'divider',
                  }}>
                    <CheckIcon sx={{ fontSize: 14, color: todo.status !== 'todo' ? 'white' : 'text.disabled' }} />
                  </IconButton>
                  <Typography variant='body2' sx={{
                    flex: 1, fontSize: '0.85rem',
                    textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                  }}>
                    {todo.title}
                  </Typography>
                  <Chip label={STATUS_LABELS[todo.status]} size='small' color={STATUS_COLORS[todo.status]}
                    sx={{ fontSize: '0.65rem', height: 18 }} />
                  <IconButton size='small' onClick={() => handleDeleteTodo(todo.todo_id)} sx={{ p: 0.25 }}>
                    <DeleteIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  </IconButton>
                </Box>
              ))}
              {todos.length === 0 && (
                <Typography variant='body2' color='text.disabled' sx={{ textAlign: 'center', py: 3, fontSize: '0.85rem' }}>
                  할 일을 추가해보세요! ✨
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}

export default MyPage;
