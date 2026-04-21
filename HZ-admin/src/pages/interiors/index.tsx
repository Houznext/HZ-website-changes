import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import withAdminLayout from '@/src/common/AdminLayout';
import apiClient from '@/src/utils/apiClient';
import AccessDenied from '@/src/common/AccessDenied';

interface ICustomer {
  fullName: string;
  mobile: string;
}
interface IRep {
  fullName: string;
}
interface IProject {
  id: string;
  customer: ICustomer;
  rep?: IRep;
  address: string;
  city: string;
  locality: string;
  bhk?: string;
  overallProgress: number;
  status: string;
  updatedAt: string;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  openSnagCount?: number;
  hasPaymentHold?: boolean;
  snagItems?: { id: string }[];
}

const STATUS_BADGE: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  onboarding: { bg: '#dbeafe', color: '#1e40af', label: 'Onboarding' },
  design: { bg: '#f3e8ff', color: '#6b21a8', label: 'Design' },
  execution: { bg: '#dcfce7', color: '#166534', label: 'Execution' },
  on_hold: { bg: '#fef3c7', color: '#92400e', label: 'On hold' },
  completed: { bg: '#f1f5f9', color: '#475569', label: 'Completed' },
  handover: { bg: '#f1f5f9', color: '#475569', label: 'Handover' },
};

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Design', value: 'design' },
  { label: 'Execution', value: 'execution' },
  { label: 'On hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
];

function dayStats(p: IProject): { label: string; est: string } {
  const start = p.expectedStartDate ? new Date(p.expectedStartDate) : null;
  const end = p.expectedEndDate ? new Date(p.expectedEndDate) : null;
  const now = new Date();
  if (!start || !end || Number.isNaN(+start) || Number.isNaN(+end)) {
    return { label: '—', est: '—' };
  }
  const total = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (86400000)),
  );
  const elapsed = Math.max(
    0,
    Math.ceil((now.getTime() - start.getTime()) / (86400000)),
  );
  const dayN = Math.min(total, elapsed + 1);
  return {
    label: `Day ${dayN} of ${total}`,
    est: end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  };
}

function ProjectCard({
  project: p,
  onOpen,
  onDelete,
  snagCount,
  paymentHold,
}: {
  project: IProject;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
  snagCount: number;
  paymentHold: boolean;
}) {
  const router = useRouter();
  const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.onboarding;
  const { label: dayLabel, est } = dayStats(p);
  const prog = Math.min(100, Math.round(Number(p.overallProgress ?? 0)));

  return (
    <Box
      onClick={onOpen}
      sx={{
        bgcolor: '#fff',
        border: '0.5px solid #e2e8f0',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        '&:hover': {
          borderColor: '#93c5fd',
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(47,128,237,0.1)',
        },
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f2a44' }}>
            {p.customer?.fullName ?? '—'}
          </Typography>
          <Box
            component="span"
            sx={{
              fontSize: '10px',
              fontWeight: 600,
              px: 1,
              py: 0.25,
              borderRadius: '6px',
              bgcolor: badge.bg,
              color: badge.color,
            }}
          >
            {badge.label}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
            mb: 1,
          }}
        >
          <span>
            {(p.bhk ?? '').replace(/\s*BHK/i, ' BHK')} · {p.city || p.locality || '—'}
          </span>
          <span>{p.rep?.fullName ?? '—'}</span>
        </Box>
        <Box
          sx={{
            height: 4,
            bgcolor: '#f1f5f9',
            borderRadius: '2px',
            position: 'relative',
            my: 1,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${prog}%`,
              bgcolor: '#2f80ed',
              borderRadius: '2px',
            }}
          />
        </Box>
        <Typography
          sx={{ fontSize: '11px', fontWeight: 700, color: '#2f80ed', textAlign: 'right' }}
        >
          {prog}%
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#64748b',
            mt: 0.5,
          }}
        >
          <span>{dayLabel}</span>
          <span>Est. {est}</span>
        </Box>
        <Box sx={{ borderTop: '0.5px solid #e2e8f0', mt: 1.25, pt: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                void router.push(`/interiors/${p.id}/update`);
              }}
              sx={{
                fontSize: '11px',
                textTransform: 'none',
                minHeight: 26,
                px: 1,
                borderColor: '#e2e8f0',
              }}
            >
              Add update
            </Button>
            {snagCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  void router.push(`/interiors/${p.id}?tab=snags`);
                }}
                sx={{
                  fontSize: '11px',
                  textTransform: 'none',
                  minHeight: 26,
                  px: 1,
                  borderColor: '#fecaca',
                  color: '#b91c1c',
                }}
              >
                {snagCount} snags
              </Button>
            )}
            {paymentHold && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  void router.push(`/interiors/${p.id}?tab=payments`);
                }}
                sx={{
                  fontSize: '11px',
                  textTransform: 'none',
                  minHeight: 26,
                  px: 1,
                  borderColor: '#fcd34d',
                  color: '#92400e',
                }}
              >
                Payment hold
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                void router.push(`/interiors/${p.id}`);
              }}
              sx={{
                fontSize: '11px',
                textTransform: 'none',
                minHeight: 26,
                px: 1,
                bgcolor: '#2f80ed',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1a6dd6', boxShadow: 'none' },
              }}
            >
              View
            </Button>
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={onDelete}
              sx={{ fontSize: '11px', textTransform: 'none', ml: 'auto' }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function InteriorsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('updated');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProjects = useCallback(async (q: string, statusFilter: string) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (q) params.search = q;
      if (statusFilter !== 'all') params.status = statusFilter;

      const { body } = await apiClient.get(
        `${apiClient.URLS.interiors}/projects`,
        params,
        true,
      );

      const data: unknown = body;
      setProjects(Array.isArray(data) ? (data as IProject[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') void loadProjects('', 'all');
  }, [status, loadProjects]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const t = setTimeout(() => void loadProjects(search, filter), 350);
    return () => clearTimeout(t);
  }, [search, filter, loadProjects, status]);

  const confirmDelete = (project: IProject) => {
    setDeletingId(project.id);
    setDeletingName(project.customer?.fullName ?? 'this project');
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await apiClient.delete(
        `${apiClient.URLS.interiors}/projects/${deletingId}`,
        {},
        true,
      );
      setProjects((prev) => prev.filter((p) => String(p.id) !== String(deletingId)));
      setDeletingId(null);
      setDeletingName('');
      await loadProjects(search, filter);
    } catch (e: unknown) {
      const err = e as { message?: string; body?: { message?: string | string[] } };
      const fromBody = err.body?.message;
      const msg =
        typeof fromBody === 'string'
          ? fromBody
          : Array.isArray(fromBody)
            ? fromBody.join(', ')
            : err.message;
      setDeleteError(msg || 'Failed to delete project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (sort === 'name')
      return (a.customer?.fullName ?? '').localeCompare(b.customer?.fullName ?? '');
    if (sort === 'progress')
      return (Number(b.overallProgress ?? 0) || 0) - (Number(a.overallProgress ?? 0) || 0);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (status === 'loading') {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton height={48} sx={{ mb: 2, borderRadius: 2 }} />
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return <AccessDenied resource="Interiors" />;
  }

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '20px', fontWeight: 500, color: '#0f172a' }}>
            Int. dashboard
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#64748b', mt: 0.5 }}>
            {projects.length} interior project{projects.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          onClick={() => void router.push('/interiors/onboard')}
          sx={{
            bgcolor: '#2f80ed',
            color: '#fff',
            borderRadius: '8px',
            px: '18px',
            py: '9px',
            fontSize: '13px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#1a6dd6',
              transform: 'translateY(-1px)',
              transition: '0.18s',
              boxShadow: 'none',
            },
          }}
        >
          New customer →
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mb: 2.5 }}>
        {FILTER_TABS.map((t) => (
          <Button
            key={t.value}
            onClick={() => setFilter(t.value)}
            sx={{
              textTransform: 'none',
              fontSize: '13px',
              borderRadius: '8px',
              px: 2,
              py: 0.75,
              minWidth: 'auto',
              bgcolor: filter === t.value ? '#2f80ed' : 'transparent',
              color: filter === t.value ? '#fff' : '#64748b',
              border: filter === t.value ? 'none' : '1px solid #e2e8f0',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: filter === t.value ? '#1a6dd6' : '#f8fafc',
                boxShadow: 'none',
              },
            }}
          >
            {t.label}
          </Button>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </InputAdornment>
            ),
          }}
          sx={{ flex: '1 1 220px', maxWidth: 360, bgcolor: '#fff', borderRadius: '8px' }}
        />
        <Select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value as string)}
          sx={{ minWidth: 160, bgcolor: '#fff', borderRadius: '8px' }}
        >
          <MenuItem value="updated">Last updated</MenuItem>
          <MenuItem value="name">Name A-Z</MenuItem>
          <MenuItem value="progress">Progress %</MenuItem>
        </Select>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '8px' }}
          action={
            <Button color="inherit" size="small" onClick={() => void loadProjects(search, filter)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !error && sortedProjects.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          <svg
            width="48"
            height="48"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            style={{ margin: '0 auto 16px', display: 'block' }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#334155', mb: 1 }}>
            No projects yet
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#64748b', mb: 3 }}>
            Onboard your first customer
          </Typography>
          <Button
            onClick={() => void router.push('/interiors/onboard')}
            sx={{
              bgcolor: '#2f80ed',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              '&:hover': { bgcolor: '#1a6dd6' },
            }}
          >
            Onboard now →
          </Button>
        </Box>
      )}

      {!loading && sortedProjects.length > 0 && (
        <Grid container spacing={1.5}>
          {sortedProjects.map((p) => {
            const snagCount = p.openSnagCount ?? p.snagItems?.length ?? 0;
            const paymentHold = Boolean(p.hasPaymentHold);
            return (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <ProjectCard
                  project={p}
                  snagCount={snagCount}
                  paymentHold={paymentHold}
                  onOpen={() => void router.push(`/interiors/${p.id}`)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    confirmDelete(p);
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={Boolean(deletingId)} onClose={() => !deleteLoading && setDeletingId(null)}>
        <DialogTitle>Delete project?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14 }}>
            Are you sure you want to permanently delete <strong>{deletingName}</strong>? This action
            cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }} onClose={() => setDeleteError('')}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => setDeletingId(null)}
            disabled={deleteLoading}
            sx={{ textTransform: 'none' }}
          >
            No
          </Button>
          <Button
            type="button"
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            disabled={deleteLoading}
            sx={{ textTransform: 'none' }}
          >
            {deleteLoading ? 'Deleting…' : 'Yes, delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdminLayout(InteriorsPage);
