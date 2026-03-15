import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ProjectDetailPage() {
  const { projectId } = useRouter().query;
  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111827', mb: 1 }}>
        Project detail
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
        Project ID: {projectId as string}
      </Typography>
    </Box>
  );
}

