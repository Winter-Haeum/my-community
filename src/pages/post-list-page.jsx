import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import bunnyImg from '../assets/bunny.png';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import PostCard from '../components/ui/post-card';
import SidebarLeft from '../components/landing/sidebar-left';
import SidebarRight from '../components/landing/sidebar-right';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const SORT_OPTIONS = [
  { value: 'new', label: '🆕 새글' },
  { value: 'hot', label: '🔥 핫' },
  { value: 'top', label: '⭐ 탑' },
];

function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sort = searchParams.get('sort') || 'new';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const q = searchParams.get('q') || '';

  useEffect(() => {
    fetchPosts();
  }, [sort, category, tag, q]);

  useEffect(() => {
    fetchTopPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('winterlog_posts')
      .select('*, winterlog_users(nickname, profile_image)');

    if (category) query = query.eq('category', category);
    if (tag) query = query.eq('status_tag', tag);
    if (q) query = query.ilike('title', `%${q}%`);

    if (sort === 'new') query = query.order('created_at', { ascending: false });
    else if (sort === 'top') query = query.order('like_count', { ascending: false });
    else if (sort === 'hot') query = query.order('view_count', { ascending: false });

    const { data } = await query.limit(20);
    setPosts(data || []);
    setLoading(false);
  };

  const fetchTopPosts = async () => {
    const { data } = await supabase
      .from('winterlog_posts')
      .select('post_id, title')
      .order('like_count', { ascending: false })
      .limit(5);
    setTopPosts(data || []);
  };

  return (
    <Container maxWidth='xl' sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Grid container spacing={{ xs: 0, md: 2 }}>
        {!isMobile && (
          <Grid size={{ md: 2.5 }}>
            <SidebarLeft />
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  component={Link}
                  to={`?sort=${opt.value}${category ? `&category=${encodeURIComponent(category)}` : ''}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`}
                  variant={sort === opt.value ? 'contained' : 'outlined'}
                  size='small'
                  sx={{
                    bgcolor: sort === opt.value ? 'primary.main' : 'transparent',
                    color: sort === opt.value ? 'text.primary' : 'text.secondary',
                    borderColor: 'divider',
                    borderRadius: 3,
                    px: 2,
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </Box>

            {!isMobile && user && (
              <Button
                variant='contained'
                component={Link}
                to='/write'
                startIcon={<EditIcon />}
                sx={{ bgcolor: 'primary.main', color: 'text.primary' }}
              >
                글쓰기
              </Button>
            )}
          </Box>

          {q && (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              "{q}" 검색 결과 ({posts.length}개)
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Box component='img' src={bunnyImg} alt='마스코트' sx={{ width: 110, height: 110, opacity: 0.85, mb: 1.5 }} />
              <Typography variant='h6' color='text.secondary' sx={{ fontWeight: 600 }}>아직 게시글이 없어요</Typography>
              <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
                첫 번째 글을 작성해보세요! 🌱
              </Typography>
            </Box>
          ) : (
            posts.map((post) => <PostCard key={post.post_id} post={post} />)
          )}
        </Grid>

        {!isMobile && (
          <Grid size={{ md: 2.5 }}>
            <SidebarRight topPosts={topPosts} />
          </Grid>
        )}
      </Grid>

      {isMobile && user && (
        <Fab
          component={Link}
          to='/write'
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: 'primary.main',
            color: 'text.primary',
            boxShadow: '0 4px 16px rgba(205, 180, 219, 0.5)',
            '&:hover': { bgcolor: 'primary.main' },
          }}
        >
          <EditIcon />
        </Fab>
      )}
    </Container>
  );
}

export default PostListPage;
