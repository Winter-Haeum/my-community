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
  { value: 'new', label: '✨ 새글' },
  { value: 'hot', label: '🔥 핫' },
  { value: 'top', label: '⭐ 탑' },
];

const POSTS_PER_PAGE = 5;

const getPageNumbers = (totalPages, currentPage) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (currentPage > 3) pages.push('...');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
};

function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sort = searchParams.get('sort') || 'new';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const q = searchParams.get('q') || '';

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  useEffect(() => {
    setPage(1);
    fetchPosts(1);
  }, [sort, category, tag, q]);

  useEffect(() => {
    fetchTopPosts();
  }, []);

  const fetchPosts = async (currentPage) => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = currentPage * POSTS_PER_PAGE - 1;

      let query = supabase
        .from('winterlog_posts')
        .select('*, winterlog_users(nickname, profile_image)', { count: 'exact' });

      if (category) query = query.eq('category', category);
      if (tag) query = query.eq('status_tag', tag);
      if (q) query = query.ilike('title', `%${q}%`);

      if (sort === 'new') query = query.order('created_at', { ascending: false });
      else if (sort === 'top') query = query.order('like_count', { ascending: false });
      else if (sort === 'hot') query = query.order('view_count', { ascending: false });

      const { data, count } = await query.range(from, to);
      setPosts(data || []);
      setTotalCount(count || 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPosts = async () => {
    const { data } = await supabase
      .from('winterlog_posts')
      .select('post_id, title')
      .order('like_count', { ascending: false })
      .limit(5);
    setTopPosts(data || []);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = getPageNumbers(totalPages, page);

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
                    bgcolor: sort === opt.value ? '#EED8FF' : 'transparent',
                    color: sort === opt.value ? '#6030A8' : 'text.secondary',
                    borderColor: sort === opt.value ? '#C8A8F0' : 'divider',
                    borderRadius: 3,
                    px: 2,
                    fontWeight: sort === opt.value ? 600 : 400,
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
              "{q}" 검색 결과 ({totalCount}개)
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Box component='img' src={bunnyImg} alt='마스코트'
                sx={{ width: 100, height: 100, objectFit: 'contain', mb: 1.5, display: 'block', mx: 'auto' }} />
              <Typography variant='h6' color='text.secondary' sx={{ fontWeight: 600 }}>아직 게시글이 없어요</Typography>
              <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
                첫 번째 글을 작성해보세요! 🌱
              </Typography>
            </Box>
          ) : (
            <>
              {posts.map((post) => <PostCard key={post.post_id} post={post} />)}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.75, mt: 3, mb: 1 }}>
                  <Button
                    size='small'
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    sx={{
                      px: 1.75, height: 36,
                      borderRadius: '999px',
                      border: '1px solid #D8C7F0',
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                      '&:hover': { bgcolor: '#F1E6FF', borderColor: '#C8A8F0' },
                      '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                    }}
                  >
                    이전
                  </Button>

                  {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                      <Typography key={`ellipsis-${idx}`} variant='body2' color='text.disabled' sx={{ px: 0.5 }}>
                        …
                      </Typography>
                    ) : (
                      <Button key={p} size='small' onClick={() => handlePageChange(p)} sx={pageBtnSx(page === p)}>
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    size='small'
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    sx={{
                      px: 1.75, height: 36,
                      borderRadius: '999px',
                      border: '1px solid #D8C7F0',
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                      '&:hover': { bgcolor: '#F1E6FF', borderColor: '#C8A8F0' },
                      '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                    }}
                  >
                    다음
                  </Button>
                </Box>
              )}
            </>
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
