import { useEffect, useState, useCallback } from 'react';
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import withAdminLayout from '@/src/common/AdminLayout';
import apiClient from '@/src/utils/apiClient';

interface ISnag {
  id: string;
  title: string;
  description: string | null;
  raisedBy: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  photoUrl: string | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  raisedAt: string;
}

const SEVERITY_STYLE: Record<
  string,
  {
    bg: string;
    color: string;
  }
> = {
  low: { bg: '#f3f4f6', color: '#6b7280' },
  medium: { bg: '#EBF3FF', color: '#1A56DB' },
  high: { bg: '#FFFBEB', color: '#92400E' },
  critical: { bg: '#FEF2F2', color: '#991B1B' },
};

const STATUS_STYLE: Record<
  string,
  {
    bg: string;
    color: string;
  }
> = {
  open: { bg: '#FEF2F2', color: '#991B1B' },
  in_progress: { bg: '#FFFBEB', color: '#92400E' },
  resolved: { bg: '#E1F5EE', color: '#085041' },
};

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function SnagsPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [snags, setSnags] = useState<ISnag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [raiseOpen, setRaiseOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [newRaisedBy, setNewRaisedBy] = useState('Rep');
  const [raising, setRaising] = useState(false);

  const [resolveSnag, setResolveSnag] = useState<ISnag | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolveBy, setResolveBy] = useState('Rep');
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      const { body } = await apiClient.get(
        `${base}/projects/${projectId}/snags`,
        {},
        true,
      );
      const data = body as unknown;
      setSnags(Array.isArray(data) ? (data as ISnag[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load snags');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRaise = async () => {
    if (!newTitle.trim() || !projectId) {
      setError('Title is required');
      return;
    }
    setRaising(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      await apiClient.post(
        `${base}/projects/${projectId}/snags`,
        {
          projectId,
          title: newTitle.trim(),
          description: newDesc || null,
          raisedBy: newRaisedBy || 'Rep',
          severity: newSeverity,
        },
        true,
      );
      setSuccess('Snag raised successfully');
      setRaiseOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewSeverity('medium');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to raise snag');
    } finally {
      setRaising(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveSnag) return;
    setResolving(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      await apiClient.patch(
        `${base}/snags/${resolveSnag.id}/resolve`,
        {
          resolvedBy: resolveBy || 'Rep',
          note: resolveNote,
        },
        true,
      );
      setSuccess('Snag resolved');
      setResolveSnag(null);
      setResolveNote('');
      setResolveBy('Rep');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  const filtered =
    statusFilter === 'all'
      ? snags
      : snags.filter((s) => s.status === statusFilter);

  const openCount = snags.filter((s) => s.status === 'open').length;
  const inProgCount = snags.filter((s) => s.status === 'in_progress').length;
  const resolvedCount = snags.filter((s) => s.status === 'resolved').length;

  const cardSx = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
  };
  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 },
  };
  const cellSx = { fontSize: 12, py: 1.5 };

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
            Snag management
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.3 }}>
            {openCount} open · {inProgCount} in progress · {resolvedCount}{' '}
            resolved
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setRaiseOpen(true)}
          sx={{
            background: '#1A56DB',
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: 12,
          }}
        >
          + Raise snag
        </Button>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {[
          { label: 'Open', count: openCount, bg: '#FEF2F2', color: '#991B1B' },
          {
            label: 'In progress',
            count: inProgCount,
            bg: '#FFFBEB',
            color: '#92400E',
          },
          {
            label: 'Resolved',
            count: resolvedCount,
            bg: '#E1F5EE',
            color: '#085041',
          },
          {
            label: 'Total',
            count: snags.length,
            bg: '#EBF3FF',
            color: '#1A56DB',
          },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Box
              sx={{
                background: s.bg,
                borderRadius: '10px',
                p: '12px 16px',
              }}
            >
              <Typography
                sx={{ fontSize: 22, fontWeight: 500, color: s.color }}
              >
                {s.count}
              </Typography>
              <Typography
                sx={{ fontSize: 11, color: s.color, opacity: 0.7 }}
              >
                {s.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

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

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['all', 'open', 'in_progress', 'resolved'].map((s) => (
          <Button
            key={s}
            size="small"
            onClick={() => setStatusFilter(s)}
            sx={{
              textTransform: 'none',
              fontSize: 11,
              borderRadius: '8px',
              background: statusFilter === s ? '#EBF3FF' : 'transparent',
              color: statusFilter === s ? '#1A56DB' : '#6b7280',
              border: `1px solid ${
                statusFilter === s ? 'rgba(26,86,219,0.2)' : 'transparent'
              }`,
            }}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </Button>
        ))}
      </Box>

      {loading ? (
        <Box sx={{ ...cardSx, p: 4, textAlign: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#1A56DB' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ ...cardSx, p: 6, textAlign: 'center' }}>
          <Typography
            sx={{ fontSize: 14, color: '#374151', fontWeight: 500 }}
          >
            {statusFilter === 'all'
              ? 'No snags raised yet'
              : `No ${statusFilter.replace('_', ' ')} snags`}
          </Typography>
        </Box>
      ) : (
        <Box sx={cardSx}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: '#fafafa' }}>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 500, color: '#374151' }}
                >
                  Title
                </TableCell>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 500, color: '#374151' }}
                >
                  Severity
                </TableCell>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 500, color: '#374151' }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 500, color: '#374151' }}
                >
                  Raised by
                </TableCell>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 500, color: '#374151' }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{ ...cellSx, fontWeight: 500, color: '#374151' }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((sn) => {
                const sev = SEVERITY_STYLE[sn.severity] ?? SEVERITY_STYLE.medium;
                const sts = STATUS_STYLE[sn.status] ?? STATUS_STYLE.open;
                return (
                  <TableRow
                    key={sn.id}
                    sx={{ '&:hover': { background: '#fafafa' } }}
                  >
                    <TableCell sx={cellSx}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#111827',
                        }}
                      >
                        {sn.title}
                      </Typography>
                      {sn.description && (
                        <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                          {sn.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={sn.severity}
                        size="small"
                        sx={{
                          background: sev.bg,
                          color: sev.color,
                          fontSize: 9,
                          height: 20,
                          borderRadius: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={sn.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          background: sts.bg,
                          color: sts.color,
                          fontSize: 9,
                          height: 20,
                          borderRadius: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: '#6b7280' }}>
                      {sn.raisedBy}
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: '#6b7280' }}>
                      {new Date(sn.raisedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {sn.status !== 'resolved' && (
                        <Button
                          size="small"
                          onClick={() => {
                            setResolveSnag(sn);
                            setResolveNote('');
                          }}
                          sx={{
                            fontSize: 10,
                            textTransform: 'none',
                            borderRadius: '6px',
                            border:
                              '1px solid rgba(29,158,117,0.3)',
                            background: '#E1F5EE',
                            color: '#085041',
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                      {sn.status === 'resolved' && sn.resolutionNote && (
                        <Typography sx={{ fontSize: 10, color: '#085041' }}>
                          ✓ {sn.resolutionNote.slice(0, 30)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 500 }}>
          Raise new snag
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
            label="Title *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            size="small"
            label="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            multiline
            rows={2}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            size="small"
            label="Raised by"
            value={newRaisedBy}
            onChange={(e) => setNewRaisedBy(e.target.value)}
            sx={fieldSx}
          />
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Severity</InputLabel>
            <Select
              label="Severity"
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value)}
            >
              {['low', 'medium', 'high', 'critical'].map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRaiseOpen(false)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRaise}
            disabled={raising}
            sx={{
              background: '#1A56DB',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {raising ? (
              <CircularProgress size={14} sx={{ color: '#fff' }} />
            ) : (
              'Raise snag'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!resolveSnag}
        onClose={() => setResolveSnag(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 15, fontWeight: 500 }}>
          Resolve: {resolveSnag?.title}
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
            label="Resolution note *"
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
            multiline
            rows={2}
            sx={fieldSx}
            placeholder="Describe how the issue was fixed"
          />
          <TextField
            fullWidth
            size="small"
            label="Resolved by"
            value={resolveBy}
            onChange={(e) => setResolveBy(e.target.value)}
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setResolveSnag(null)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResolve}
            disabled={resolving || !resolveNote.trim()}
            sx={{
              background: '#1D9E75',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {resolving ? (
              <CircularProgress size={14} sx={{ color: '#fff' }} />
            ) : (
              'Mark resolved'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdminLayout(SnagsPage);

