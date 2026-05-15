import { Link, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const CATEGORIES = [
  { label: '전체', value: '' },
  { label: '공지사항', value: '공지사항' },
  { label: '프론트엔드', value: '프론트엔드' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'React', value: 'React' },
  { label: 'AI 활용', value: 'AI 활용' },
  { label: '오류 해결 기록', value: '오류 해결 기록' },
  { label: '포트폴리오 피드백', value: '포트폴리오 피드백' },
  { label: '일상 공부 기록', value: '일상 공부 기록' },
  { label: '자유 게시판', value: '자유 게시판' },
];

const STATUS_TAGS = [
  { label: '📚 공부중', value: '공부중' },
  { label: '❓ 질문', value: '질문' },
  { label: '✅ 해결완료', value: '해결완료' },
  { label: '📝 회고', value: '회고' },
  { label: '💡 팁공유', value: '팁공유' },
];

function SidebarLeft() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'new';

  const buildLink = ({ category, tag }) => {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    return `/?${params.toString()}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 80 }}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
          📂 카테고리
        </Typography>
        <List dense disablePadding>
          {CATEGORIES.map((cat) => (
            <ListItem key={cat.value} disablePadding>
              <ListItemButton
                component={Link}
                to={buildLink({ category: cat.value, tag: currentTag })}
                selected={currentCategory === cat.value}
                sx={{
                  borderRadius: 2,
                  mb: 0.25,
                  '&.Mui-selected': {
                    bgcolor: '#EED8FF',
                    '&:hover': { bgcolor: '#E4C8FF' },
                    '& .MuiListItemText-primary': { fontWeight: 700, color: '#6030A8' },
                  },
                }}
              >
                <ListItemText primary={cat.label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
          🏷 상태 태그
        </Typography>
        <List dense disablePadding>
          {STATUS_TAGS.map((tag) => (
            <ListItem key={tag.value} disablePadding>
              <ListItemButton
                component={Link}
                to={buildLink({ category: currentCategory, tag: tag.value })}
                selected={currentTag === tag.value}
                sx={{
                  borderRadius: 2,
                  mb: 0.25,
                  '&.Mui-selected': {
                    bgcolor: '#EED8FF',
                    '&:hover': { bgcolor: '#E4C8FF' },
                    '& .MuiListItemText-primary': { fontWeight: 700, color: '#6030A8' },
                  },
                }}
              >
                <ListItemText primary={tag.label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default SidebarLeft;
