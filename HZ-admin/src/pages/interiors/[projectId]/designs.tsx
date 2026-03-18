import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import withAdminLayout from '@/src/common/AdminLayout';
import apiClient from '@/src/utils/apiClient';

interface IDesignUpload {
  id: string;
  roomTag: string;
  s3Url: string;
  designType: 'sample' | 'full';
  designNotes: string | null;
  uploadedBy: string;
  version: number;
  createdAt: string;
}

interface IProject {
  id: string;
  designStatus: string;
  customer: { fullName: string; mobile: string };
  city: string;
  locality: string;
  bhk?: string;
}

const ROOM_TAGS = [
  'Living room',
  'Master bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Kitchen',
  'Dining area',
  'Bathroom',
  'Master bathroom',
  'Balcony',
  'Pooja room',
  'Study room',
  'Entrance / Foyer',
];

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function DesignsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [project, setProject] = useState<IProject | null>(null);
  const [designs, setDesigns] = useState<Record<string, IDesignUpload[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedRoom, setSelectedRoom] = useState('Living room');
  const [designType, setDesignType] = useState<'sample' | 'full'>('full');
  const [designNotes, setDesignNotes] = useState('');
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      const [{ body: projBody }, { body: designBody }] = await Promise.all([
        apiClient.get(`${base}/projects/${projectId}`, {}, true),
        apiClient.get(`${base}/projects/${projectId}/designs`, {}, true),
      ]);
      setProject(projBody as IProject);
      const d = designBody as unknown;
      setDesigns(
        d && typeof d === 'object' && !Array.isArray(d)
          ? (d as Record<string, IDesignUpload[]>)
          : {},
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to load project',
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPreviewFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (previewFiles.length === 0) {
      setError('Select at least one image');
      return;
    }
    if (!projectId || typeof projectId !== 'string') return;
    setUploading(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      for (const file of previewFiles) {
        const placeholderUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(
          file.name,
        )}`;
        await apiClient.post(
          `${base}/projects/${projectId}/designs`,
          {
            projectId,
            roomTag: selectedRoom,
            s3Url: placeholderUrl,
            designType,
            designNotes: designNotes || null,
            uploadedBy: 'Rep',
            version: 1,
          },
          true,
        );
      }
      setSuccess(
        `${previewFiles.length} design(s) uploaded for ${selectedRoom}`,
      );
      setPreviewFiles([]);
      setPreviewUrls([]);
      setDesignNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const cardSx = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
  };
  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 },
  };

  const totalDesigns = Object.values(designs).reduce(
    (s, arr) => s + arr.length,
    0,
  );
  const rooms = Object.keys(designs);

  const statusColor: Record<
    string,
    {
      bg: string;
      color: string;
    }
  > = {
    pending: { bg: '#f3f4f6', color: '#6b7280' },
    uploaded: { bg: '#EBF3FF', color: '#1A56DB' },
    approved: { bg: '#E1F5EE', color: '#085041' },
    revision_requested: { bg: '#FFFBEB', color: '#92400E' },
  };

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3 }}>
      <Button
        onClick={() =>
          router.push(`/interiors/${(projectId as string) ?? project?.id}`)
        }
        size="small"
        sx={{
          textTransform: 'none',
          fontSize: 12,
          color: '#6b7280',
          mb: 2,
          pl: 0,
        }}
      >
        ← Back to project
      </Button>

      <Box
        sx={{
          ...cardSx,
          p: '14px 20px',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: 16, fontWeight: 500, color: '#111827' }}
          >
            3D Designs — {project?.customer?.fullName ?? '...'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.3 }}>
            {project?.bhk ? `${project.bhk} · ` : ''}
            {project?.city ?? ''} · {totalDesigns} design
            {totalDesigns !== 1 ? 's' : ''} uploaded
          </Typography>
        </Box>
        {project?.designStatus && (
          <Chip
            label={project.designStatus.replace('_', ' ')}
            size="small"
            sx={{
              background:
                statusColor[project.designStatus]?.bg ?? '#f3f4f6',
              color:
                statusColor[project.designStatus]?.color ?? '#6b7280',
              fontSize: 11,
              fontWeight: 500,
              height: 24,
              borderRadius: '20px',
            }}
          />
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '8px' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: '8px' }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ ...cardSx, p: 2.5 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 2 }}
            >
              Upload designs
            </Typography>

            <FormControl fullWidth size="small" sx={{ ...fieldSx, mb: 2 }}>
              <InputLabel>Room / area</InputLabel>
              <Select
                label="Room / area"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                {ROOM_TAGS.map((r) => (
                  <MenuItem key={r} value={r} sx={{ fontSize: 13 }}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ ...fieldSx, mb: 2 }}>
              <InputLabel>Design type</InputLabel>
              <Select
                label="Design type"
                value={designType}
                onChange={(e) =>
                  setDesignType(e.target.value as 'sample' | 'full')
                }
              >
                <MenuItem value="sample" sx={{ fontSize: 13 }}>
                  Sample design
                </MenuItem>
                <MenuItem value="full" sx={{ fontSize: 13 }}>
                  Full design
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Designer notes (optional)"
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              multiline
              rows={2}
              sx={{ ...fieldSx, mb: 2 }}
              placeholder="e.g. Warm tones used, ISS carcass for kitchen"
            />

            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed rgba(26,86,219,0.3)',
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                mb: 2,
                background: '#fafbff',
                '&:hover': { borderColor: '#1A56DB', background: '#EBF3FF' },
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: '#1A56DB',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                Click to browse images
              </Typography>
              <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>
                JPG, PNG accepted · Multiple files allowed
              </Typography>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {previewUrls.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2,
                }}
              >
                {previewUrls.map((url, i) => (
                  <Box
                    key={url}
                    sx={{
                      width: 64,
                      height: 50,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ))}
                <Typography sx={{ fontSize: 10, color: '#6b7280', width: '100%' }}>
                  {previewFiles.length} file
                  {previewFiles.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || previewFiles.length === 0}
              sx={{
                background: '#1A56DB',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} />
                  Uploading...
                </>
              ) : (
                `Upload ${
                  previewFiles.length > 0
                    ? `${previewFiles.length} image(s)`
                    : 'designs'
                }`
              )}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {loading ? (
            <Box sx={{ ...cardSx, p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: '#1A56DB' }} />
            </Box>
          ) : totalDesigns === 0 ? (
            <Box sx={{ ...cardSx, p: 6, textAlign: 'center' }}>
              <Typography
                sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}
              >
                No designs uploaded yet
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>
                Upload images using the form on the left
              </Typography>
            </Box>
          ) : (
            rooms.map((room) => (
              <Box key={room} sx={{ ...cardSx, mb: 2 }}>
                <Box
                  sx={{
                    p: '12px 16px',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}
                  >
                    {room}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                    {designs[room].length} image
                    {designs[room].length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1.5}>
                    {designs[room].map((d) => (
                      <Grid item xs={6} sm={4} key={d.id}>
                        <Box
                          sx={{
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            '&:hover': { borderColor: '#1A56DB' },
                          }}
                          onClick={() => setLightbox(d.s3Url)}
                        >
                          <Box
                            sx={{
                              height: 120,
                              background: '#f3f4f6',
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              src={d.s3Url}
                              alt={d.roomTag}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://via.placeholder.com/300x200?text=Design';
                              }}
                            />
                          </Box>
                          <Box sx={{ p: '6px 8px' }}>
                            <Typography
                              sx={{ fontSize: 10, color: '#374151' }}
                            >
                              {d.designType === 'full'
                                ? 'Full design'
                                : 'Sample'}
                            </Typography>
                            {d.designNotes && (
                              <Typography
                                sx={{
                                  fontSize: 9,
                                  color: '#9ca3af',
                                  mt: 0.3,
                                }}
                                noWrap
                              >
                                {d.designNotes}
                              </Typography>
                            )}
                            <Typography
                              sx={{ fontSize: 9, color: '#9ca3af' }}
                            >
                              {new Date(
                                d.createdAt,
                              ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ))
          )}
        </Grid>
      </Grid>

      <Dialog
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, background: '#000' }}>
          {lightbox && (
            <img
              src={lightbox}
              alt="Design"
              style={{ width: '100%', display: 'block' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ background: '#111' }}>
          <Button
            onClick={() => setLightbox(null)}
            sx={{ color: '#fff', textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdminLayout(DesignsPage);

