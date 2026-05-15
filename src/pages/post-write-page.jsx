import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

const CATEGORIES = ['프론트엔드', 'JavaScript', 'React', 'AI 활용', '오류 해결 기록', '포트폴리오 피드백', '일상 공부 기록', '자유 게시판'];
const STATUS_TAGS = ['공부중', '질문', '해결완료', '회고', '팁공유'];

const MARKDOWN_PLACEHOLDER = `# 제목을 여기에 작성하세요

본문을 **Markdown**으로 작성할 수 있어요.

## 코드 예시

\`\`\`javascript
// 코드 블록 지원
console.log('Hello, Winter Log!');
\`\`\`

> 인용구도 사용할 수 있어요

- 목록 1
- 목록 2
- 목록 3`;

function PostWritePage() {
  const [form, setForm] = useState({ title: '', content: '', category: '', status_tag: '' });
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return setError('제목과 내용을 입력해주세요.');
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('winterlog_posts')
        .insert({
          user_id: user.id,
          title: form.title,
          content: form.content,
          category: form.category || null,
          status_tag: form.status_tag || null,
        })
        .select()
        .single();
      if (err) throw err;

      const today = new Date().toISOString().split('T')[0];
      const { data: existingLog } = await supabase
        .from('winterlog_study_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('study_date', today)
        .single();

      if (existingLog) {
        await supabase.from('winterlog_study_logs')
          .update({ post_count: (existingLog.post_count || 0) + 1 })
          .eq('log_id', existingLog.log_id);
      } else {
        await supabase.from('winterlog_study_logs')
          .insert({ user_id: user.id, study_date: today, post_count: 1 });
      }

      if (profile) {
        const newScore = (profile.activity_score || 0) + 10;
        await supabase.from('winterlog_users')
          .update({ activity_score: newScore })
          .eq('user_id', user.id);
        setProfile({ ...profile, activity_score: newScore });
      }

      navigate(`/post/${data.post_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>✏️ 글쓰기</Typography>

        {error && <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label='제목'
            value={form.title}
            onChange={handleChange('title')}
            placeholder='제목을 입력하세요'
            required
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={form.category}
                onChange={handleChange('category')}
                label='카테고리'
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=''>선택 안 함</MenuItem>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>상태 태그</InputLabel>
              <Select
                value={form.status_tag}
                onChange={handleChange('status_tag')}
                label='상태 태그'
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=''>선택 안 함</MenuItem>
                {STATUS_TAGS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1, minHeight: 40 }}>
              <Tab label='편집' sx={{ minHeight: 40 }} />
              <Tab label='미리보기' sx={{ minHeight: 40 }} />
            </Tabs>

            {tab === 0 ? (
              <TextField
                multiline
                rows={18}
                value={form.content}
                onChange={handleChange('content')}
                placeholder={MARKDOWN_PLACEHOLDER}
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.875rem', borderRadius: 2 } }}
              />
            ) : (
              <Paper variant='outlined' sx={{
                p: 3,
                minHeight: 450,
                borderRadius: 2,
                overflow: 'auto',
                '& h1, & h2, & h3': { mt: 2, mb: 1 },
                '& p': { lineHeight: 1.8, mb: 1.5 },
                '& code': { bgcolor: 'background.default', px: 0.75, py: 0.25, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875em' },
                '& pre': { bgcolor: 'background.default', p: 2, borderRadius: 2, overflow: 'auto' },
                '& pre code': { bgcolor: 'transparent' },
                '& blockquote': { borderLeft: '3px solid', borderColor: 'primary.main', pl: 2, my: 2, color: 'text.secondary' },
                '& ul, & ol': { pl: 3 },
                '& li': { mb: 0.5 },
              }}>
                {form.content
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                  : <Typography color='text.disabled'>미리보기가 여기에 표시됩니다</Typography>
                }
              </Paper>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={() => navigate(-1)} sx={{ borderRadius: 2 }}>취소</Button>
            <Button
              type='submit'
              variant='contained'
              disabled={loading}
              sx={{ bgcolor: 'primary.main', color: 'text.primary', px: 4, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : '게시하기'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default PostWritePage;
