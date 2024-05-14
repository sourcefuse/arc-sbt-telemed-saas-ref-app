import { Theme, alpha } from '@mui/material/styles';
import { Paper, Box, SxProps } from '@mui/material';

type BlockProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  paperSX?: SxProps<Theme>;
};

export function Block({ sx, children, paperSX }: BlockProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        ...paperSX,
      }}
    >
      <Box
        sx={{
          p: 4,
          minHeight: 90,
          ...sx,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
