import Box from '@mui/material/Box';
import authBgImg from '../../assets/auth-bg.png';

function AuthLeftPanel() {
  return (
    <Box sx={{
      flex: '0 0 48%',
      bgcolor: '#8B78C0',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box
        component='img'
        src={authBgImg}
        alt=''
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
        }}
      />
    </Box>
  );
}

export default AuthLeftPanel;
