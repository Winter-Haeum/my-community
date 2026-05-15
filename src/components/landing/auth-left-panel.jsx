import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import bunnyImg from '../../assets/bunny.png';

/**
 * AuthLeftPanel 컴포넌트
 * 로그인/회원가입 페이지의 공통 왼쪽 일러스트 패널
 */
function AuthLeftPanel() {
  const stars = [
    { top: '6%', left: '10%', size: 5 },
    { top: '11%', right: '14%', size: 3 },
    { top: '30%', left: '7%', size: 4 },
    { top: '45%', right: '8%', size: 3.5 },
    { bottom: '28%', right: '11%', size: 4.5 },
    { bottom: '15%', left: '16%', size: 3 },
    { top: '58%', left: '12%', size: 2.5 },
  ];

  return (
    <Box sx={{
      flex: '0 0 48%',
      background: 'linear-gradient(175deg, #C8B8EC 0%, #B4A4E0 30%, #9E88D0 60%, #8870B8 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      pt: 5,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 별 장식 */}
      {stars.map((s, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          width: s.size,
          height: s.size,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.88)',
          top: s.top, left: s.left, right: s.right, bottom: s.bottom,
          boxShadow: `0 0 ${s.size * 2.5}px rgba(255,255,255,0.75)`,
          animation: `twinkle ${1.4 + i * 0.38}s ease-in-out infinite`,
        }} />
      ))}

      {/* 상단 텍스트 */}
      <Typography variant='h5' sx={{
        color: '#FFFFFF',
        fontWeight: 700,
        textAlign: 'center',
        mb: 0.75,
        fontSize: '1.25rem',
        textShadow: '0 2px 10px rgba(60,30,120,0.35)',
        zIndex: 1,
      }}>
        오늘도 성장하는 중 🌱
      </Typography>
      <Typography variant='body2' sx={{
        color: 'rgba(255,255,255,0.78)',
        textAlign: 'center',
        mb: 3.5,
        fontSize: '0.82rem',
        lineHeight: 1.6,
        zIndex: 1,
      }}>
        기록하고, 공유하고, 함께 성장해요.
      </Typography>

      {/* 아치형 창문 */}
      <Box sx={{
        position: 'relative',
        width: '72%',
        paddingTop: '46%',
        borderRadius: '50% 50% 6px 6px',
        border: '2px solid rgba(255,255,255,0.32)',
        bgcolor: 'rgba(195,185,240,0.14)',
        mb: 3,
        zIndex: 1,
      }}>
        {/* 달 */}
        <Box sx={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FFEFD0, #FFD880)',
          boxShadow: '0 0 18px rgba(255,220,100,0.6), 0 0 36px rgba(255,200,80,0.3)',
        }} />

        {/* 창문 안 작은 별들 */}
        {[
          { top: '10%', left: '20%', size: 2 },
          { top: '12%', right: '18%', size: 2.5 },
          { bottom: '18%', left: '16%', size: 1.8 },
          { bottom: '22%', right: '15%', size: 2 },
        ].map((s, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            bgcolor: 'rgba(255,246,200,0.85)',
            top: s.top, left: s.left, right: s.right, bottom: s.bottom,
            boxShadow: `0 0 ${s.size * 2}px rgba(255,240,160,0.8)`,
          }} />
        ))}

        {/* 창문 중간 선 */}
        <Box sx={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: '50%',
          width: '1.5px',
          bgcolor: 'rgba(255,255,255,0.18)',
          transform: 'translateX(-50%)',
        }} />
      </Box>

      {/* 토끼 캐릭터 */}
      <Box sx={{
        width: 148,
        height: 148,
        borderRadius: '50%',
        overflow: 'hidden',
        bgcolor: 'rgba(255,255,255,0.14)',
        boxShadow: '0 0 0 6px rgba(255,255,255,0.09), 0 8px 40px rgba(70,25,140,0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        <Box component='img' src={bunnyImg} alt='Winter Log 마스코트'
          sx={{ width: '90%', height: '90%', objectFit: 'contain' }} />
      </Box>

      {/* 하단 포인트 */}
      <Box sx={{ mt: 3, display: 'flex', gap: 1, zIndex: 1 }}>
        {['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)'].map((c, i) => (
          <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c }} />
        ))}
      </Box>
    </Box>
  );
}

export default AuthLeftPanel;
