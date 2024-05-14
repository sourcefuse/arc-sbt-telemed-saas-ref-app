// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
// auth
import { useAuth } from '../../../data/auth';
// components
import { CustomAvatar } from '../../../components/custom-avatar';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { user, session } = useAuth();

  return (
    <Link underline="none" color="inherit">
      <StyledRoot>
        <CustomAvatar
          src={'https://i.imgur.com/W7mWVd5.png'}
          alt={user?.userId}
          name={user?.username}
        />

        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.username}
          </Typography>

          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.secondary' }}
            title={(session?.tokens?.idToken?.payload.email ?? '') as string}
          >
            {(session?.tokens?.idToken?.payload.email ?? '') as string}
          </Typography>
        </Box>
      </StyledRoot>
    </Link>
  );
}
