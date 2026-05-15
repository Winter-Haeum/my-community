import { useState, useEffect } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const getMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().split('T')[0];
  });
};

const STATUS_COLORS = { todo: 'default', progress: 'warning', done: 'success' };
const STATUS_LABELS = { todo: '대기', progress: '진행중', done: '완료' };
const TODO_STATUS_NEXT = { todo: 'progress', progress: 'done', done: 'todo' };

function MyPage() {
  const { user, profile, setProfile } = useAuthStore();
  const [studyLogs, setStudyLogs] = useState([]);
  const [todos, setTodos] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [todayGoal, setTodayGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [editGoal, setEditGoal] = useState(false);

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
      supabase.from('winterlog_posts').select('post_id, title, created_at, like_count').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('winterlog_study_logs').select('goal').eq('user_id', user.id).eq('study_date', today).single(),
    ]);
    setStudyLogs(logsRes.data?.map((l) => l.study_date) || []);
    setTodos(todosRes.data || []);
    setRecentPosts(postsRes.data || []);
    setTodayGoal(todayLogRes.data?.goal || '');
    setLoading(false);
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    const { data } = await supabase
      .from('winterlog_todos')
      .insert({ user_id: user.id, title: newTodo, status: 'todo' })
      .select()
      .single();
    setTodos((prev) => [data, ...prev]);
    setNewTodo('');
  };

  const handleTodoStatus = async (todo) => {
    const nextStatus = TODO_STATUS_NEXT[todo.status];
    await supabase.from('winterlog_todos')
      .update({ status: nextStatus, completed_at: nextStatus === 'done' ? new Date().toISOString() : null })
      .eq('todo_id', todo.todo_id);
    setTodos((prev) => prev.map((t) => t.todo_id === todo.todo_id ? { ...t, status: nextStatus } : t));

    if (nextStatus === 'done' && profile) {
      const newScore = (profile.activity_score || 0) + 3;
      await supabase.from('winterlog_users').update({ activity_score: newScore }).eq('user_id', user.id);
      setProfile({ ...profile, activity_score: newScore });
    }
  };

  const handleDeleteTodo = async (todoId) => {
    await supabase.from('winterlog_todos').delete().eq('todo_id', todoId);
    setTodos((prev) => prev.filter((t) => t.todo_id !== todoId));
  };

  const handleSaveGoal = async () => {
    const { data: existingLog } = await supabase
      .from('winterlog_study_logs')
      .select('log_id')
      .eq('user_id', user.id)
      .eq('study_date', today)
      .single();

    if (existingLog) {
      await supabase.from('winterlog_study_logs')
        .update({ goal: todayGoal })
        .eq('log_id', existingLog.log_id);
    } else {
      await supabase.from('winterlog_study_logs')
        .insert({ user_id: user.id, study_date: today, goal: todayGoal });
      setStudyLogs((prev) => [...prev, today]);
    }
    setEditGoal(false);
  };

  const todoStats = {
    total: todos.length,
    progress: todos.filter((t) => t.status === 'progress').length,
    done: todos.filter((t) => t.status === 'done').length,
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', mx: 'auto', mb: 2 }}>
              {profile?.nickname?.[0] || user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              {profile?.nickname || '닉네임 없음'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2, mt: 0.5 }}>
              {profile?.bio || '자기소개가 없습니다'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {profile?.activity_score || 0}
                </Typography>
                <Typography variant='caption' color='text.secondary'>활동 점수</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {studyLogs.length}
                </Typography>
                <Typography variant='caption' color='text.secondary'>공부 일수</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>🎯 오늘의 목표</Typography>
              <Button size='small' onClick={() => setEditGoal(!editGoal)} sx={{ color: 'text.secondary' }}>
                {editGoal ? '취소' : '수정'}
              </Button>
            </Box>
            {editGoal ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size='small'
                  fullWidth
                  value={todayGoal}
                  onChange={(e) => setTodayGoal(e.target.value)}
                  placeholder='오늘의 공부 목표를 입력하세요'
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                />
                <Button
                  variant='contained'
                  size='small'
                  onClick={handleSaveGoal}
                  sx={{ bgcolor: 'primary.main', color: 'text.primary', flexShrink: 0 }}
                >
                  저장
                </Button>
              </Box>
            ) : (
              <Typography
                variant='body1'
                sx={{ color: todayGoal ? 'text.primary' : 'text.disabled', fontStyle: todayGoal ? 'normal' : 'italic' }}
              >
                {todayGoal || '오늘의 목표를 설정해보세요 💪'}
              </Typography>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>🌿 이번달 공부 잔디</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant='body2' sx={{ fontWeight: 600 }}>{studyLogs.length}일 활동</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {monthDates.map((date) => (
                <Tooltip key={date} title={date} placement='top'>
                  <Box sx={{
                    width: 18,
                    height: 18,
                    borderRadius: 0.5,
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
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>📋 오늘 할 일</Typography>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Typography variant='caption' color='text.secondary'>전체 {todoStats.total}</Typography>
              <Typography variant='caption' color='warning.main'>진행중 {todoStats.progress}</Typography>
              <Typography variant='caption' color='success.main'>완료 {todoStats.done}</Typography>
            </Box>

            {todoStats.total > 0 && (
              <LinearProgress
                variant='determinate'
                value={(todoStats.done / todoStats.total) * 100}
                color='success'
                sx={{ mb: 2, borderRadius: 1, height: 6 }}
              />
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size='small'
                fullWidth
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder='할 일을 입력하세요'
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <IconButton
                onClick={handleAddTodo}
                sx={{ bgcolor: 'primary.main', borderRadius: 1, '&:hover': { bgcolor: '#C0A0D0' } }}
              >
                <AddIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 300, overflowY: 'auto' }}>
              {todos.map((todo) => (
                <Box key={todo.todo_id} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.25,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  opacity: todo.status === 'done' ? 0.6 : 1,
                }}>
                  <IconButton
                    size='small'
                    onClick={() => handleTodoStatus(todo)}
                    sx={{
                      p: 0.25,
                      bgcolor: todo.status === 'done' ? 'success.main' : todo.status === 'progress' ? 'warning.main' : 'divider',
                      borderRadius: 1,
                      '&:hover': { bgcolor: todo.status === 'done' ? 'success.dark' : 'warning.main' },
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 14, color: todo.status !== 'todo' ? 'white' : 'text.disabled' }} />
                  </IconButton>
                  <Typography
                    variant='body2'
                    sx={{
                      flex: 1,
                      fontSize: '0.85rem',
                      textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                    }}
                  >
                    {todo.title}
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[todo.status]}
                    size='small'
                    color={STATUS_COLORS[todo.status]}
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                  <IconButton size='small' onClick={() => handleDeleteTodo(todo.todo_id)} sx={{ p: 0.25 }}>
                    <DeleteIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  </IconButton>
                </Box>
              ))}
              {todos.length === 0 && (
                <Typography variant='body2' color='text.disabled' sx={{ textAlign: 'center', py: 2 }}>
                  할 일을 추가해보세요! ✨
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 2 }}>📝 최근 작성 게시글</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recentPosts.length === 0 ? (
                <Typography variant='body2' color='text.disabled' sx={{ textAlign: 'center', py: 4 }}>
                  아직 작성한 게시글이 없습니다
                </Typography>
              ) : (
                recentPosts.map((post) => (
                  <Box
                    key={post.post_id}
                    component={Link}
                    to={`/post/${post.post_id}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      textDecoration: 'none',
                      '&:hover': { bgcolor: 'primary.main' },
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Typography
                      variant='body2'
                      color='text.primary'
                      sx={{ fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {post.title}
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ ml: 1, flexShrink: 0 }}>
                      ❤️ {post.like_count || 0}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default MyPage;
