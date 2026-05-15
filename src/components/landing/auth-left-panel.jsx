import Box from '@mui/material/Box';
import authBgImg from '../../assets/auth-bg.png';

function AuthLeftPanel() {
  return (
    <Box sx={{
      flex: '0 0 48%',
      backgroundImage: `url(${authBgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }} />
  );
}

export default AuthLeftPanel;
