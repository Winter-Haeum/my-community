import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const STATUS_TAG_COLORS = {
  '공부중': '#D4EDFF',
  '질문': '#BDE0FE',
  '해결완료': '#C8F7C5',
  '회고': '#E8D5F5',
  '팁공유': '#FFE5B4',
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHr < 24) return `${diffHr}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
};

/**
 * PostCard 컴포넌트
 *
 * Props:
 * @param {object} post - 게시글 데이터 [Required]
 * @param {function} onLike - 좋아요 핸들러 [Optional]
 *
 * Example usage:
 * <PostCard post={post} onLike={handleLike} />
 */
function PostCard({ post, onLike }) {
  return (
    <Card sx={{
      mb: 1.5,
      transition: 'transform 0.15s, box-shadow 0.15s',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 24px rgba(155, 130, 204, 0.2)',
        borderColor: 'primary.light',
      },
    }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1, flexWrap: 'wrap' }}>
          {post.category && (
            <Chip
              label={post.category}
              size='small'
              sx={{ bgcolor: 'primary.main', color: 'text.primary', fontSize: '0.7rem', height: 22 }}
            />
          )}
          {post.status_tag && (
            <Chip
              label={post.status_tag}
              size='small'
              sx={{ bgcolor: STATUS_TAG_COLORS[post.status_tag] || '#E0E0E0', color: '#4A4A4A', fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Box>

        <Typography
          component={Link}
          to={`/post/${post.post_id}`}
          variant='h6'
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '0.95rem', md: '1rem' },
            display: 'block',
            mb: 0.75,
            '&:hover': { color: 'primary.main' },
            transition: 'color 0.15s',
          }}
        >
          {post.title}
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mb: 1.5,
          fontSize: '0.85rem',
          lineHeight: 1.6,
        }}>
          {post.content?.replace(/[#*`>\[\]!]/g, '').substring(0, 120)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main', fontSize: '0.65rem' }}>
              {post.winterlog_users?.nickname?.[0] || '?'}
            </Avatar>
            <Typography variant='caption' color='text.secondary'>
              {post.winterlog_users?.nickname || '익명'}
            </Typography>
          </Box>

          <Typography variant='caption' color='text.disabled'>•</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <AccessTimeIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant='caption' color='text.disabled'>
              {formatDate(post.created_at)}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <VisibilityIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant='caption' color='text.disabled'>{post.view_count || 0}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <ModeCommentOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant='caption' color='text.disabled'>{post.comment_count || 0}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size='small' onClick={() => onLike?.(post.post_id)} sx={{ p: 0.25 }}>
              {post.userLiked
                ? <FavoriteIcon sx={{ fontSize: 16, color: '#FF6B6B' }} />
                : <FavoriteBorderIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
            </IconButton>
            <Typography variant='caption' color='text.secondary'>{post.like_count || 0}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PostCard;
