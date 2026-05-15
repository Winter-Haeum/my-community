import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

const STUDY_QUOTES = [
  '오늘도 천천히 성장하는 중...',
  '작은 기록이 내일의 실력이 됩니다.',
  '에러는 성장의 흔적입니다.',
  '꾸준함이 최고의 재능입니다.',
  '오늘의 공부가 미래의 나를 만듭니다.',
];

const randomQuote = STUDY_QUOTES[Math.floor(Math.random() * STUDY_QUOTES.length)];

/**
 * SidebarRight 컴포넌트
 *
 * Props:
 * @param {Array} topPosts - 인기 게시글 목록 [Optional, 기본값: []]
 *
 * Example usage:
 * <SidebarRight topPosts={topPosts} />
 */
function SidebarRight({ topPosts = [] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 80 }}>
      <Paper elevation={0} sx={{
        p: 2.5,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(248, 236, 255, 0.88) 0%, rgba(232, 218, 255, 0.78) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(200, 175, 245, 0.45)',
        boxShadow: '0 4px 20px rgba(155, 100, 220, 0.12)',
      }}>
        <Typography variant='h6' sx={{ fontWeight: 700, color: '#5828A0', mb: 1, fontSize: '1rem' }}>
          ❄️ Winter Log
        </Typography>
        <Typography variant='body2' sx={{ color: '#7848B8', lineHeight: 1.6, fontSize: '0.8rem' }}>
          프론트엔드 공부, AI 활용, 성장 기록을 공유하는 감성 커뮤니티입니다.
          개발 입문자들이 함께 성장하는 공간이에요 🌱
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
          💬 오늘의 공부 문장
        </Typography>
        <Typography variant='body2' sx={{ fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6 }}>
          "{randomQuote}"
        </Typography>
      </Paper>

      {topPosts.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
            🔥 인기 게시글
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {topPosts.slice(0, 5).map((post, i) => (
              <Box key={post.post_id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.8rem', minWidth: 16 }}>
                  {i + 1}
                </Typography>
                <MuiLink
                  component={RouterLink}
                  to={`/post/${post.post_id}`}
                  underline='hover'
                  sx={{ color: 'text.primary', fontSize: '0.8rem', lineHeight: 1.4 }}
                >
                  {post.title}
                </MuiLink>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
          📌 공지사항
        </Typography>
        <Box component='ul' sx={{ m: 0, pl: 2.5 }}>
          {['서로 존중하는 커뮤니티를 만들어요', '공부 기록을 자유롭게 공유해요', '질문은 언제든지 환영합니다 🙌'].map((text) => (
            <Typography key={text} component='li' variant='body2' color='text.secondary' sx={{ fontSize: '0.8rem', lineHeight: 1.8 }}>
              {text}
            </Typography>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default SidebarRight;
