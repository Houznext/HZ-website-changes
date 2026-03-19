import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import withAdminLayout from '@/src/common/AdminLayout';
import apiClient from '@/src/utils/apiClient';

interface IProject {
  id: string;
  status: string;
  isHandedOver: boolean;
  handoverDate: string | null;
  customer: { fullName: string; mobile: string };
  city: string;
  locality: string;
  bhk?: string;
}

interface IDocument {
  id: string;
  category: string;
  documentName: string;
  s3Url: string;
  uploadedBy: string;
  createdAt: string;
  expiresAt: string | null;
}

interface ISnag {
  id: string;
  title: string;
  status: string;
}

const DOC_CATEGORIES = [
  'warranty',
  'invoice',
  'floor_plan',
  'report',
  'other',
];
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'token';
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) ?? '' : '';

function HandoverPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [project, setProject] = useState<IProject | null>(null);
  const [documents, setDocuments] = useState<Record<string, IDocument[]>>({});
  const [snags, setSnags] = useState<ISnag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completing, setCompleting] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('warranty');
  const [docUrl, setDocUrl] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      const [projRes, docRes, snagRes] = await Promise.all([
        apiClient.get(`${base}/projects/${projectId}`, {}, true),
        apiClient.get(`${base}/projects/${projectId}/documents`, {}, true),
        apiClient.get(`${base}/projects/${projectId}/snags`, {}, true),
      ]);
      setProject(projRes.body as IProject);
      const d = docRes.body as unknown;
      const s = snagRes.body as unknown;
      setDocuments(
        d && typeof d === 'object' && !Array.isArray(d)
          ? (d as Record<string, IDocument[]>)
          : {},
      );
      setSnags(Array.isArray(s) ? (s as ISnag[]) : []);
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

  const handleUploadDoc = async () => {
    if (!docName.trim() || !docUrl.trim()) {
      setError('Name and URL are required');
      return;
    }
    if (!projectId) return;
    setUploading(true);
    setError('');
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          projectId,
          documentName: docName.trim(),
          category: docCategory,
          s3Url: docUrl.trim(),
          uploadedBy: 'Rep',
          expiresAt: docExpiry || null,
        }),
      });
      if (!res.ok) throw new Error('Upload failed');
      setSuccess('Document uploaded');
      setUploadOpen(false);
      setDocName('');
      setDocUrl('');
      setDocExpiry('');
      setDocCategory('warranty');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteHandover = async () => {
    if (!projectId) return;
    const openSnags = snags.filter((s) => s.status !== 'resolved');
    if (openSnags.length > 0) {
      setError(
        `${openSnags.length} snag(s) still open. Resolve all snags before handover.`,
      );
      return;
    }
    setCompleting(true);
    setError('');
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          status: 'handover',
          isHandedOver: true,
          handoverDate: new Date().toISOString().split('T')[0],
        }),
      });
      if (!res.ok) throw new Error('Failed to mark handover');
      setSuccess(
        'Project marked as handed over! Customer can now sign off in their portal.',
      );
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Handover failed');
    } finally {
      setCompleting(false);
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

  const openSnagCount = snags.filter((s) => s.status !== 'resolved').length;
  const totalDocs = Object.values(documents).reduce(
    (s, a) => s + a.length,
    0,
  );
  const isHandedOver = project?.isHandedOver;

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3 }}>
      <Button
        onClick={() =>
          router.push(`/interiors/${(projectId as string) ?? ''}`)
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
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: 16, fontWeight: 500, color: '#111827' }}
          >
            Handover — {project?.customer?.fullName ?? '...'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.3 }}>
            {openSnagCount > 0
              ? `${openSnagCount} open snag(s) must be resolved first`
              : 'Ready for handover'}
          </Typography>
        </Box>
        <Chip
          label={isHandedOver ? 'Handed over' : project?.status ?? ''}
          size="small"
          sx={{
            background: isHandedOver ? '#E1F5EE' : '#EBF3FF',
            color: isHandedOver ? '#085041' : '#1A56DB',
            fontSize: 11,
            fontWeight: 500,
            height: 24,
            borderRadius: '20px',
          }}
        />
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

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            label: 'Open snags',
            value: openSnagCount,
            ok: openSnagCount === 0,
            okText: 'All resolved',
            badText: `${openSnagCount} remaining`,
          },
          {
            label: 'Documents uploaded',
            value: totalDocs,
            ok: totalDocs > 0,
            okText: `${totalDocs} documents`,
            badText: 'No documents',
          },
        ].map((item) => (
          <Grid item xs={12} sm={6} key={item.label}>
            <Box
              sx={{
                background: item.ok ? '#E1F5EE' : '#FEF2F2',
                borderRadius: '10px',
                p: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: item.ok ? '#1D9E75' : '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {item.ok ? '✓' : '!'}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: item.ok ? '#085041' : '#991B1B',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: item.ok ? '#0F6E56' : '#DC2626',
                  }}
                >
                  {item.ok ? item.okText : item.badText}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Box sx={{ ...cardSx, mb: 2 }}>
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
                Documents ({totalDocs})
              </Typography>
              <Button
                size="small"
                onClick={() => setUploadOpen(true)}
                sx={{
                  fontSize: 11,
                  textTransform: 'none',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                }}
              >
                + Upload document
              </Button>
            </Box>
            {totalDocs === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                  No documents uploaded yet
                </Typography>
              </Box>
            ) : (
              Object.entries(documents).map(([cat, docs]) => (
                <Box key={cat}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      px: 2,
                      py: 1,
                    }}
                  >
                    {cat.replace('_', ' ')}
                  </Typography>
                  {docs.map((doc, i) => (
                    <Box key={doc.id}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: '#EBF3FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          📄
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#111827',
                            }}
                          >
                            {doc.documentName}
                          </Typography>
                          <Typography
                            sx={{ fontSize: 10, color: '#9ca3af' }}
                          >
                            {new Date(
                              doc.createdAt,
                            ).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {doc.expiresAt
                              ? ` · Expires ${new Date(
                                  doc.expiresAt,
                                ).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}`
                              : ''}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => window.open(doc.s3Url, '_blank')}
                          sx={{
                            fontSize: 10,
                            textTransform: 'none',
                            color: '#1A56DB',
                            minWidth: 0,
                          }}
                        >
                          View
                        </Button>
                      </Box>
                      {i < docs.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          {!isHandedOver ? (
            <Box sx={{ ...cardSx, p: 2.5 }}>
              <Typography
                sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 1 }}
              >
                Mark handover complete
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: '#6b7280',
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                This will mark the project as handed over. The customer will be
                notified and can sign off in their portal.
              </Typography>
              {openSnagCount > 0 && (
                <Alert
                  severity="warning"
                  sx={{ mb: 2, borderRadius: '8px', fontSize: 11 }}
                >
                  {openSnagCount} snag(s) still open. Go to snags page to
                  resolve them first.
                </Alert>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={handleCompleteHandover}
                disabled={completing || openSnagCount > 0}
                sx={{
                  background: '#1D9E75',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: 13,
                  py: 1.2,
                }}
              >
                {completing ? (
                  <>
                    <CircularProgress
                      size={14}
                      sx={{ color: '#fff', mr: 1 }}
                    />
                    Processing...
                  </>
                ) : (
                  'Complete handover ✓'
                )}
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                background: '#E1F5EE',
                border: '1px solid rgba(29,158,117,0.2)',
                borderRadius: '12px',
                p: 2.5,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 24, mb: 1 }}>✓</Typography>
              <Typography
                sx={{ fontSize: 14, fontWeight: 500, color: '#085041' }}
              >
                Project handed over
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#0F6E56', mt: 0.5 }}>
                {project?.handoverDate
                  ? `On ${new Date(
                      project.handoverDate,
                    ).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`
                  : ''}
              </Typography>
            </Box>
          )}

          <Box sx={{ ...cardSx, mt: 2, p: '12px 16px' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}
              >
                Snags
              </Typography>
              <Button
                size="small"
                onClick={() =>
                  router.push(`/interiors/${(projectId as string) ?? ''}/snags`)
                }
                sx={{
                  fontSize: 10,
                  textTransform: 'none',
                  color: '#1A56DB',
                }}
              >
                Manage →
              </Button>
            </Box>
            {snags.slice(0, 4).map((sn) => (
              <Box
                key={sn.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.75,
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background:
                      sn.status === 'resolved' ? '#1D9E75' : '#EF4444',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{ fontSize: 11, color: '#374151', flex: 1 }}
                  noWrap
                >
                  {sn.title}
                </Typography>
                <Chip
                  label={sn.status}
                  size="small"
                  sx={{
                    fontSize: 9,
                    height: 16,
                    borderRadius: '10px',
                    background:
                      sn.status === 'resolved' ? '#E1F5EE' : '#FEF2F2',
                    color:
                      sn.status === 'resolved' ? '#085041' : '#991B1B',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 500 }}>
          Upload document
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: '12px !important',
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Document name *"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            sx={fieldSx}
            placeholder="e.g. Greenply warranty card"
          />
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
            >
              {DOC_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                  {c.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Document URL *"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            sx={fieldSx}
            placeholder="https://... (S3 URL or any accessible URL)"
          />
          <TextField
            fullWidth
            size="small"
            label="Expiry date (optional — for warranties)"
            type="date"
            value={docExpiry}
            onChange={(e) => setDocExpiry(e.target.value)}
            sx={fieldSx}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setUploadOpen(false)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadDoc}
            disabled={uploading}
            sx={{
              background: '#1A56DB',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {uploading ? (
              <CircularProgress size={14} sx={{ color: '#fff' }} />
            ) : (
              'Upload'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdminLayout(HandoverPage);

