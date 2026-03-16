import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import withAdminLayout from '@/src/common/AdminLayout';
import apiClient from '@/src/utils/apiClient';

interface ICustomer { fullName: string; mobile: string; }
interface IRep { fullName: string; }
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
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  execution:   { bg: '#EBF3FF', color: '#1A56DB' },
  design:      { bg: '#EBF3FF', color: '#1A56DB' },
  onboarding:  { bg: '#f3f4f6', color: '#6b7280' },
  handover:    { bg: '#FFFBEB', color: '#92400E' },
  completed:   { bg: '#E1F5EE', color: '#085041' },
  on_hold:     { bg: '#FFFBEB', color: '#92400E' },
};

const FILTER_TABS = [
  { label: 'All',          value: 'all' },
  { label: 'In progress',  value: 'execution' },
  { label: 'Design',       value: 'design' },
  { label: 'On hold',      value: 'on_hold' },
  { label: 'Completed',    value: 'completed' },
  { label: 'Handover',     value: 'handover' },
];

function InteriorsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [view, setView]         = useState<string>('cards');
  const [sort, setSort]         = useState('updated');

  const loadProjects = useCallback(async (q: string, status: string) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (q) params.search = q;
      if (status !== 'all') params.status = status;

      const { body } = await apiClient.get(
        `${apiClient.URLS.interiors}/projects`,
        params,
        true,
      );

      const data: unknown = body;
      setProjects(Array.isArray(data) ? (data as IProject[]) : []);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to load projects',
      );
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects('', 'all'); }, [loadProjects]);

  useEffect(() => {
    const t = setTimeout(() => loadProjects(search, filter), 350);
    return () => clearTimeout(t);
  }, [search, filter, loadProjects]);

  const sortedProjects = [...projects].sort((a, b) => {
    if (sort === 'name') return (a.customer?.fullName ?? '').localeCompare(b.customer?.fullName ?? '');
    if (sort === 'progress') return (b.overallProgress ?? 0) - (a.overallProgress ?? 0);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const pill = (status: string) => STATUS_STYLE[status] ?? STATUS_STYLE.onboarding;

  const headerSx = {
    background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px', p: '14px 20px', mb: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3 }}>

      {/* ── Page header ── */}
      <Box sx={headerSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: '9px', background: '#EBF3FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="#1A56DB" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
              BuildLive Interiors
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => router.push('/interiors/onboard')}
          sx={{
            background: '#1A56DB', borderRadius: '8px', textTransform: 'none',
            fontSize: 12, fontWeight: 500, boxShadow: 'none',
            '&:hover': { background: '#1547c0', boxShadow: 'none' },
          }}
        >
          + Onboard new customer
        </Button>
      </Box>

      {/* ── Toolbar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(t => (
          <Button key={t.value} size="small" onClick={() => setFilter(t.value)}
            sx={{
              textTransform: 'none', fontSize: 11, borderRadius: '8px', minWidth: 'auto',
              background: filter === t.value ? '#EBF3FF' : 'transparent',
              color: filter === t.value ? '#1A56DB' : '#6b7280',
              fontWeight: filter === t.value ? 500 : 400,
              border: `1px solid ${filter === t.value ? 'rgba(26,86,219,0.2)' : 'transparent'}`,
              '&:hover': { background: '#f3f4f6' },
            }}
          >{t.label}</Button>
        ))}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search client or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </InputAdornment>
              ),
              sx: { borderRadius: '8px', fontSize: 12 },
            }}
            sx={{ width: 210 }}
          />
          <Select size="small" value={sort} onChange={e => setSort(e.target.value)}
            sx={{ borderRadius: '8px', fontSize: 11, minWidth: 148 }}>
            <MenuItem value="updated"  sx={{ fontSize: 11 }}>Sort: Last updated</MenuItem>
            <MenuItem value="name"     sx={{ fontSize: 11 }}>Name A–Z</MenuItem>
            <MenuItem value="progress" sx={{ fontSize: 11 }}>Progress %</MenuItem>
          </Select>
          <ToggleButtonGroup size="small" exclusive value={view}
            onChange={(_, v) => { if (v) setView(v); }}
            sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <ToggleButton value="cards" sx={{ fontSize: 11, textTransform: 'none', border: 'none', px: 1.5 }}>Cards</ToggleButton>
            <ToggleButton value="list"  sx={{ fontSize: 11, textTransform: 'none', border: 'none', px: 1.5 }}>List</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Error ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <Grid container spacing={1.5}>
          {[1,2,3,4,5,6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={168} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && sortedProjects.length === 0 && (
        <Box sx={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px', p: 7, textAlign: 'center',
        }}>
          <svg width="40" height="40" fill="none" stroke="#e5e7eb" strokeWidth="1.5"
            viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
            No projects found
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5, mb: 3 }}>
            {filter !== 'all' ? 'Try a different filter' : 'Onboard your first customer to get started'}
          </Typography>
          {filter === 'all' && (
            <Button variant="contained" onClick={() => router.push('/interiors/onboard')}
              sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 12, boxShadow: 'none' }}>
              + Onboard new customer
            </Button>
          )}
        </Box>
      )}

      {/* ── Project cards ── */}
      {!loading && sortedProjects.length > 0 && (
        <Grid container spacing={1.5}>
          {sortedProjects.map(p => {
            const s = pill(p.status);
            return (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card
                  onClick={() => router.push(`/interiors/${p.id}`)}
                  sx={{
                    borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#1A56DB', boxShadow: '0 2px 12px rgba(26,86,219,0.1)' },
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                          {p.customer?.fullName ?? 'Unknown'}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#9ca3af', mt: 0.3 }}>
                          {p.bhk ? `${p.bhk} · ` : ''}{p.city || p.locality || p.address || '—'}
                        </Typography>
                      </Box>
                      <Chip label={p.status.replace('_', ' ')} size="small"
                        sx={{ background: s.bg, color: s.color, fontSize: 9, fontWeight: 500, height: 20, borderRadius: '20px' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <LinearProgress variant="determinate"
                        value={Math.min(Math.round(p.overallProgress ?? 0), 100)}
                        sx={{
                          flex: 1, height: 4, borderRadius: 4, background: '#f3f4f6',
                          '& .MuiLinearProgress-bar': { background: '#1D9E75', borderRadius: 4 },
                        }}
                      />
                      <Typography sx={{ fontSize: 10, color: '#6b7280', flexShrink: 0 }}>
                        {Math.round(p.overallProgress ?? 0)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>
                        Rep: {p.rep?.fullName ?? '—'}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>
                        {new Date(p.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions
                    onClick={e => e.stopPropagation()}
                    sx={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: '#fafafa', gap: 0.5, p: '6px 10px' }}
                  >
                    <Button size="small" onClick={() => router.push(`/interiors/${p.id}/update`)}
                      sx={{ fontSize: 10, textTransform: 'none', borderRadius: '6px', border: '1px solid rgba(29,158,117,0.25)', background: '#E1F5EE', color: '#085041', '&:hover': { background: '#d1efe4' } }}>
                      Add update
                    </Button>
                    <Button size="small" onClick={() => router.push(`/interiors/${p.id}`)}
                      sx={{ fontSize: 10, textTransform: 'none', borderRadius: '6px', border: '1px solid #e5e7eb', color: '#374151' }}>
                      View
                    </Button>
                    <Button size="small" onClick={() => window.open(`tel:${p.customer?.mobile ?? ''}`)}
                      sx={{ fontSize: 10, textTransform: 'none', borderRadius: '6px', border: '1px solid #e5e7eb', color: '#374151' }}>
                      Call
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default withAdminLayout(InteriorsPage);

