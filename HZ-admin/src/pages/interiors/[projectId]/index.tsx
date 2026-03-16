import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import withAdminLayout from '@/src/common/AdminLayout';

interface ITradeTemplate { name: string; iconName: string; slug: string; }
interface ITrade {
  id: string; customName: string | null; template: ITradeTemplate;
  overallProgress: number; status: string;
  lastUpdatedAt: string | null; weightage: number;
}
interface IMilestone {
  id: string; milestoneName: string; amount: number;
  status: string; sortOrder: number;
}
interface ISnag { id: string; title: string; severity: string; status: string; }
interface IProject {
  id: string; status: string; overallProgress: number;
  address: string; city: string; locality: string; bhk?: string;
  expectedStartDate?: string; expectedEndDate?: string;
  customer: { fullName: string; mobile: string; email?: string };
  rep?: { fullName: string; designation: string; mobile: string; email: string };
  trades?: ITrade[];
}

const TRADE_EMOJI: Record<string, string> = {
  'modular-kitchen':'🍳','wardrobes':'🚪','false-ceiling':'⬛',
  'flooring':'🔲','painting':'🖌','electrical':'⚡',
  'plumbing':'💧','bathroom-remodel':'🚿','tv-unit':'📺',
  'pooja-unit':'🪔','study-unit':'📚','shoe-rack':'👟',
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  in_progress: { bg: '#EBF3FF', color: '#1A56DB' },
  not_started: { bg: '#f3f4f6', color: '#6b7280' },
  on_hold:     { bg: '#FFFBEB', color: '#92400E' },
  completed:   { bg: '#E1F5EE', color: '#085041' },
};

function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [project, setProject]       = useState<IProject | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [snags, setSnags]           = useState<ISnag[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true); setError('');
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const [pRes, mRes, sRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/milestones`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/snags?status=open`, { headers: h }),
      ]);
      if (!pRes.ok) throw new Error(`Project not found (${pRes.status})`);
      const [p, m, s] = await Promise.all([pRes.json(), mRes.json(), sRes.json()]) as [IProject, IMilestone[], ISnag[]];
      setProject(p);
      setMilestones(Array.isArray(m) ? m : []);
      setSnags(Array.isArray(s) ? s : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, API]);

  useEffect(() => { load(); }, [load]);

  const cardSx = {
    background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  if (loading) return (
    <Box sx={{ p: 3 }}>
      <Skeleton height={80} sx={{ borderRadius: '12px', mb: 2 }} />
      <Grid container spacing={1.5}>
        {[1,2,3,4].map(i => <Grid item xs={6} md={3} key={i}><Skeleton height={80} sx={{ borderRadius: '12px' }} /></Grid>)}
      </Grid>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ borderRadius: '8px' }}>
        {error}
        <Button size="small" onClick={load} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    </Box>
  );

  if (!project) return null;

  const trades = project.trades ?? [];
  const progress = Math.round(project.overallProgress ?? 0);

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3 }}>

      {/* Back */}
      <Button onClick={() => router.push('/interiors')} size="small"
        sx={{ textTransform: 'none', fontSize: 12, color: '#6b7280', mb: 2, pl: 0 }}>
        ← All projects
      </Button>

      {/* Project hero card */}
      <Box sx={{ ...cardSx, p: '16px 20px', mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke="#1D9E75" strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 26 * progress / 100} ${2 * Math.PI * 26 * (1 - progress / 100)}`}
              strokeLinecap="round" transform="rotate(-90 32 32)"/>
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{progress}%</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
            {project.customer?.fullName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.3 }}>
            {project.bhk ? `${project.bhk} · ` : ''}{project.city || project.locality || project.address}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.8, alignItems: 'center' }}>
            <Chip label={project.status} size="small"
              sx={{ fontSize: 9, height: 20, borderRadius: '20px', background: '#EBF3FF', color: '#1A56DB' }} />
            {project.expectedEndDate && (
              <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>
                Target: {new Date(project.expectedEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => router.push(`/interiors/${project.id}/update`)}
            variant="contained"
            sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 12, boxShadow: 'none' }}>
            Add update
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Left column */}
        <Grid item xs={12} md={8}>

          {/* Trades */}
          <Box sx={{ ...cardSx, mb: 2 }}>
            <Box sx={{ p: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Trades</Typography>
              <Button size="small" variant="outlined"
                sx={{ fontSize: 11, textTransform: 'none', borderRadius: '6px', borderColor: '#e5e7eb', color: '#374151' }}>
                + Add trade
              </Button>
            </Box>
            {trades.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>No trades added yet</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1 }}>
                <Grid container spacing={1}>
                  {trades.map(t => {
                    const ts = STATUS_STYLE[t.status] ?? STATUS_STYLE.not_started;
                    const name = t.customName ?? t.template?.name ?? 'Trade';
                    const slug = t.template?.slug ?? '';
                    const emoji = TRADE_EMOJI[slug] ?? '🔧';
                    return (
                      <Grid item xs={12} sm={6} key={t.id}>
                        <Box sx={{
                          border: '1px solid rgba(0,0,0,0.07)', borderRadius: '10px',
                          p: '10px 12px', cursor: 'pointer',
                          '&:hover': { borderColor: '#1A56DB', background: '#fafbff' },
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ fontSize: 16, width: 28, height: 28, borderRadius: '6px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {emoji}
                            </Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#111827', flex: 1 }}>{name}</Typography>
                            <Chip label={t.status.replace('_', ' ')} size="small"
                              sx={{ fontSize: 9, height: 18, borderRadius: '20px', background: ts.bg, color: ts.color }} />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate"
                              value={Math.min(Math.round(t.overallProgress ?? 0), 100)}
                              sx={{
                                flex: 1, height: 3, borderRadius: 3, background: '#f3f4f6',
                                '& .MuiLinearProgress-bar': { background: '#1D9E75', borderRadius: 3 },
                              }}
                            />
                            <Typography sx={{ fontSize: 10, color: '#6b7280', flexShrink: 0 }}>
                              {Math.round(t.overallProgress ?? 0)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Box>

          {/* Open snags */}
          {snags.length > 0 && (
            <Box sx={{ ...cardSx, mb: 2 }}>
              <Box sx={{ p: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                  Open snags ({snags.length})
                </Typography>
              </Box>
              <Box sx={{ p: '6px 16px' }}>
                {snags.map((sn, i) => (
                  <Box key={sn.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: sn.severity === 'critical' ? '#EF4444' : sn.severity === 'high' ? '#F59E0B' : '#6b7280' }} />
                      <Typography sx={{ fontSize: 12, color: '#374151', flex: 1 }}>{sn.title}</Typography>
                      <Chip label={sn.severity} size="small"
                        sx={{ fontSize: 9, height: 18, borderRadius: '20px', background: '#FEF2F2', color: '#991B1B' }} />
                    </Box>
                    {i < snags.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        {/* Right sidebar */}
        <Grid item xs={12} md={4}>

          {/* Rep card */}
          {project.rep && (
            <Box sx={{ ...cardSx, p: '12px 16px', mb: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#111827', mb: 1.5 }}>Designer</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', background: '#E1F5EE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: '#085041', flexShrink: 0,
                }}>
                  {project.rep.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{project.rep.fullName}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>{project.rep.designation}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Button size="small" onClick={() => window.open(`https://wa.me/91${project.rep!.mobile}`)}
                      sx={{ fontSize: 10, textTransform: 'none', color: '#1A56DB', p: 0, minWidth: 0 }}>WhatsApp</Button>
                    <Button size="small" onClick={() => window.open(`tel:${project.rep!.mobile}`)}
                      sx={{ fontSize: 10, textTransform: 'none', color: '#1A56DB', p: 0, minWidth: 0 }}>Call</Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Customer contact */}
          <Box sx={{ ...cardSx, p: '12px 16px', mb: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#111827', mb: 1 }}>Customer</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{project.customer.fullName}</Typography>
            <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.3 }}>{project.customer.mobile}</Typography>
            {project.customer.email && (
              <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>{project.customer.email}</Typography>
            )}
          </Box>

          {/* Payment milestones */}
          {milestones.length > 0 && (
            <Box sx={{ ...cardSx, p: '12px 16px', mb: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#111827', mb: 1.5 }}>Payment milestones</Typography>
              {[...milestones].sort((a,b) => a.sortOrder - b.sortOrder).map((m, i) => (
                <Box key={m.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: m.status === 'paid' ? '#1D9E75' : m.status === 'requested' ? '#1A56DB' : '#e5e7eb',
                    }} />
                    <Typography sx={{ fontSize: 11, color: '#374151', flex: 1 }}>{m.milestoneName}</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 500,
                      color: m.status === 'paid' ? '#085041' : m.status === 'requested' ? '#1A56DB' : '#9ca3af' }}>
                      {m.amount > 0 ? `₹${m.amount.toLocaleString('en-IN')}` : '—'}
                      {m.status === 'paid' ? ' ✓' : ''}
                    </Typography>
                  </Box>
                  {i < milestones.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAdminLayout(ProjectDetailPage);

