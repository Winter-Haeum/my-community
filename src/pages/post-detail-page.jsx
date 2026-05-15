import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const ADMIN_EMAIL = 'a01033490494@gmail.com';

const formatDate = (dateStr) => new Date(dateStr).toLocaleString('ko-KR');

/**
 * CommentItem 컴포넌트
 *
 * Props:
 * @param {object} comment - 댓글 데이터 [Required]
 * @param {string} postId - 게시글 ID [Required]
 * @param {function} onRefresh - 댓글 목록 새로고침 함수 [Required]
 * @param {number} depth - 댓글 깊이 [Optional, 기본값: 0]
 */
function CommentItem({ comment, postId, onRefresh, depth = 0 }) {
  const [reply, setReply] = useState('');
  const [showReply, setShowReply] = useState(false);
  const { user } = useAuthStore();

  const handleReply = async () => {
    if (!reply.trim() || !user) return;
    await supabase.from('winterlog_comments').insert({
      post_id: postId,
      user_id: user.id,
      parent_comment_id: comment.comment_id,
      content: reply,
    });
    setReply('');
    setShowReply(false);
    onRefresh();
  };

  return (
    <Box sx={{ ml: depth > 0 ? { xs: 2, md: 4 } : 0, mt: 1 }}>
      <Box sx={{
        display: 'flex',
        gap: 1.5,
        p: 1.5,
        bgcolor: depth > 0 ? 'background.default' : 'transparent',
        borderRadius: 2,
        border: depth > 0 ? '1px solid' : 'none',
        borderColor: 'divider',
      }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem', flexShrink: 0 }}>
          {comment.winterlog_users?.nickname?.[0] || '?'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant='caption' sx={{ fontWeight: 600 }}>
              {comment.winterlog_users?.nickname || '익명'}
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              {formatDate(comment.created_at)}
            </Typography>
          </Box>
          <Typography variant='body2' sx={{ lineHeight: 1.6 }}>{comment.content}</Typography>
          {user && depth === 0 && (
            <Button
              size='small'
              onClick={() => setShowReply(!showReply)}
              sx={{ mt: 0.5, p: 0, minWidth: 'auto', color: 'text.secondary', fontSize: '0.75rem' }}
            >
              {showReply ? '취소' : '답글'}
            </Button>
          )}
          {showReply && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <TextField
                size='small'
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder='답글을 입력하세요'
                multiline
                maxRows={3}
                sx={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
              />
              <Button
                variant='contained'
                size='small'
                onClick={handleReply}
                sx={{ bgcolor: 'primary.main', color: 'text.primary', alignSelf: 'flex-end', flexShrink: 0 }}
              >
                등록
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      {comment.replies?.map((r) => (
        <CommentItem key={r.comment_id} comment={r} postId={postId} onRefresh={onRefresh} depth={depth + 1} />
      ))}
    </Box>
  );
}

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState({ liked: false, bookmarked: false });
  const [error, setError] = useState('');

  const isAdmin = user?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAuthor = user && post && user.id === post.user_id;
  const isNotice = post?.category === '공지사항';
  const canEdit = isAuthor || (isAdmin && isNotice);
  const canDelete = isAuthor || isAdmin;

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (user) fetchUserReactions();
  }, [id, user]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('winterlog_posts')
      .select('*, winterlog_users(nickname, profile_image)')
      .eq('post_id', id)
      .single();
    setPost(data);
    setLoading(false);
    if (data) {
      supabase.rpc('increment_view_count', { p_post_id: id });
    }
  };

  const fetchComments = async () => {
    const { data: roots } = await supabase
      .from('winterlog_comments')
      .select('*, winterlog_users(nickname, profile_image)')
      .eq('post_id', id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true });

    const commentsWithReplies = await Promise.all(
      (roots || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('winterlog_comments')
          .select('*, winterlog_users(nickname, profile_image)')
          .eq('parent_comment_id', comment.comment_id)
          .order('created_at', { ascending: true });
        return { ...comment, replies: replies || [] };
      })
    );
    setComments(commentsWithReplies);
  };

  const fetchUserReactions = async () => {
    if (!user) return;
    const { data: reactions } = await supabase
      .from('winterlog_post_reactions')
      .select('reaction_type')
      .eq('post_id', id)
      .eq('user_id', user.id);

    const { data: bm } = await supabase
      .from('winterlog_bookmarks')
      .select('bookmark_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();

    const types = (reactions || []).map((r) => r.reaction_type);
    setUserReactions({
      liked: types.includes('like'),
      bookmarked: !!bm,
    });
  };

  const handleReaction = async (type) => {
    if (!user) return navigate('/login');
    const wasLiked = userReactions.liked;

    // 즉시 UI 반영 (optimistic update)
    setUserReactions((prev) => ({ ...prev, liked: !wasLiked }));
    setPost((prev) => ({ ...prev, like_count: Math.max(0, (prev.like_count || 0) + (wasLiked ? -1 : 1)) }));

    const { error: rpcError } = await supabase.rpc('toggle_post_reaction', {
      p_post_id: id,
      p_reaction_type: type,
    });

    if (rpcError) {
      // 실패 시 롤백
      setUserReactions((prev) => ({ ...prev, liked: wasLiked }));
      setPost((prev) => ({ ...prev, like_count: Math.max(0, (prev.like_count || 0) + (wasLiked ? 1 : -1)) }));
    }
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/login');
    if (userReactions.bookmarked) {
      await supabase.from('winterlog_bookmarks').delete().eq('post_id', id).eq('user_id', user.id);
    } else {
      await supabase.from('winterlog_bookmarks').insert({ post_id: id, user_id: user.id });
    }
    fetchUserReactions();
  };

  const handleEdit = () => navigate(`/post/${id}/edit`);

  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    const { error: err } = await supabase.from('winterlog_posts').delete().eq('post_id', id);
    if (err) { setError(err.message); return; }
    navigate('/');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다!');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setError('');
    const { error: err } = await supabase.from('winterlog_comments').insert({
      post_id: id,
      user_id: user.id,
      content: newComment,
    });
    if (err) { setError(err.message); return; }
    await supabase.rpc('update_comment_count', { p_post_id: id, p_delta: 1 });

    // 댓글 작성 → 공부 활동 기록
    const today = new Date().toISOString().split('T')[0];
    const { data: existingLog } = await supabase
      .from('winterlog_study_logs')
      .select('log_id')
      .eq('user_id', user.id)
      .eq('study_date', today)
      .single();
    if (!existingLog) {
      await supabase.from('winterlog_study_logs')
        .insert({ user_id: user.id, study_date: today, post_count: 0 });
    }

    setNewComment('');
    fetchComments();
    fetchPost();
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress sx={{ color: 'primary.main' }} />
    </Box>
  );

  if (!post) return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Alert severity='error'>게시글을 찾을 수 없습니다.</Alert>
    </Container>
  );

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2, color: 'text.secondary' }}>
        목록으로
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, bgcolor: 'background.paper', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {post.category && <Chip label={post.category} size='small' sx={{ bgcolor: 'primary.main', color: 'text.primary' }} />}
          {post.status_tag && <Chip label={post.status_tag} size='small' variant='outlined' />}
        </Box>

        <Typography variant='h4' sx={{ fontWeight: 700, mb: 2, lineHeight: 1.4, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {post.winterlog_users?.nickname?.[0]}
          </Avatar>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {isNotice ? 'Winter Log' : post.winterlog_users?.nickname}
          </Typography>
            <Typography variant='caption' color='text.secondary'>{formatDate(post.created_at)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{
          '& h1, & h2, & h3': { color: 'text.primary', mt: 3, mb: 1.5 },
          '& p': { lineHeight: 1.8, mb: 1.5 },
          '& code': { bgcolor: 'background.default', px: 0.75, py: 0.25, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875em' },
          '& pre': { bgcolor: 'background.default', p: 2, borderRadius: 2, overflow: 'auto', mb: 2 },
          '& pre code': { bgcolor: 'transparent', p: 0 },
          '& blockquote': { borderLeft: '3px solid', borderColor: 'primary.main', pl: 2, my: 2, color: 'text.secondary', fontStyle: 'italic' },
          '& ul, & ol': { pl: 3, mb: 1.5 },
          '& li': { mb: 0.5, lineHeight: 1.8 },
          '& a': { color: 'primary.main' },
          '& img': { maxWidth: '100%', borderRadius: 2 },
          '& table': { width: '100%', borderCollapse: 'collapse', mb: 2 },
          '& th, & td': { border: '1px solid', borderColor: 'divider', p: 1 },
        }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </Box>

        <Divider sx={{ mt: 3, mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant={userReactions.liked ? 'contained' : 'outlined'}
            startIcon={userReactions.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={() => handleReaction('like')}
            size='small'
            sx={{
              borderRadius: 3,
              bgcolor: userReactions.liked ? '#FF6B6B' : 'transparent',
              borderColor: '#FF6B6B',
              color: userReactions.liked ? 'white' : '#FF6B6B',
              '&:hover': { bgcolor: '#FF6B6B', color: 'white', borderColor: '#FF6B6B' },
            }}
          >
            좋아요 {post.like_count || 0}
          </Button>
          <Button
            variant={userReactions.bookmarked ? 'contained' : 'outlined'}
            startIcon={userReactions.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={handleBookmark}
            size='small'
            sx={{ borderRadius: 3, bgcolor: userReactions.bookmarked ? 'secondary.main' : 'transparent' }}
          >
            저장
          </Button>
          <Button
            variant='outlined'
            startIcon={<ShareIcon />}
            onClick={handleShare}
            size='small'
            sx={{ borderRadius: 3 }}
          >
            공유
          </Button>

          <Box sx={{ flex: 1 }} />

          {canEdit && (
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size='small'
              sx={{ borderRadius: 3, borderColor: 'primary.light', color: 'primary.main' }}
            >
              수정
            </Button>
          )}
          {canDelete && (
            <Button
              variant='outlined'
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              size='small'
              sx={{ borderRadius: 3, borderColor: '#FF8A80', color: '#FF6B6B' }}
            >
              삭제
            </Button>
          )}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
          댓글 {post.comment_count || 0}개
        </Typography>

        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

        {user ? (
          <Box sx={{ mb: 3, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', flexShrink: 0, fontSize: '0.875rem' }}>
              {user.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='댓글을 작성하세요...'
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  sx={{ bgcolor: 'primary.main', color: 'text.primary' }}
                >
                  댓글 등록
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <Alert severity='info' sx={{ mb: 3, borderRadius: 2 }}>
            <Link to='/login' style={{ color: '#CDB4DB' }}>로그인</Link>하여 댓글을 작성하세요.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {comments.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
              첫 번째 댓글을 작성해보세요! 🌱
            </Typography>
          ) : (
            comments.map((c) => (
              <CommentItem key={c.comment_id} comment={c} postId={id} onRefresh={fetchComments} />
            ))
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default PostDetailPage;
