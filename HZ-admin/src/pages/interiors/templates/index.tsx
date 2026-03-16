import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import withAdminLayout from '@/src/common/AdminLayout';

interface ITemplate {
  id: string; name: string; slug: string; iconName: string;
  unit: string; defaultWeightage: number; isActive: boolean; isCustom: boolean;
  checkpoints?: { checkpointName: string }[];
}

function TemplatesPage() {
  const [templates, setTemplates]   = useState<ITemplate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [creating, setCreating]     = useState(false);
  const [newName, setNewName]       = useState('');
  const [newUnit, setNewUnit]       = useState('nos');
  const [newIcon, setNewIcon]       = useState('Wrench');
  const [newWeight, setNewWeight]   = useState('10');
  const [newCheckpoints, setNewCheckpoints] = useState(['']);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/trade-templates`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: unknown = await res.json();
      setTemplates(Array.isArray(data) ? (data as ITemplate[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) { setError('Trade name is required'); return; }
    setCreating(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/trade-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: newName.trim(),
          iconName: newIcon || 'Wrench',
          unit: newUnit || 'nos',
          defaultWeightage: parseFloat(newWeight) || 10,
          checkpoints: newCheckpoints.filter(c => c.trim()).map(c => ({ checkpointName: c.trim() })),
        }),
      });
      if (!res.ok) throw new Error('Failed to create template');
      setSuccess(`Trade "${newName}" created successfully`);
      setNewName(''); setNewUnit('nos'); setNewIcon('Wrench');
      setNewWeight('10'); setNewCheckpoints(['']);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } };

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3 }}>
      <Box sx={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', p: '14px 20px', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Trade templates</Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>Manage work type templates used across all projects</Typography>
        </Box>
        <Chip label="Super admin only" size="small" sx={{ background: '#FFFBEB', color: '#92400E', fontSize: 10 }} />
      </Box>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Existing templates */}
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151', mb: 1.5 }}>
        Existing templates ({templates.length})
      </Typography>
      {loading ? (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {[1,2,3,4,5,6].map(i => <Grid item xs={12} sm={6} md={4} key={i}><Skeleton height={90} sx={{ borderRadius: '10px' }} /></Grid>)}
        </Grid>
      ) : (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {templates.map(t => (
            <Grid item xs={12} sm={6} md={4} key={t.id}>
              <Box sx={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', p: '12px 14px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{t.name}</Typography>
                  <Chip label={t.isActive ? 'Active' : 'Inactive'} size="small"
                    sx={{ fontSize: 9, height: 18, background: t.isActive ? '#E1F5EE' : '#f3f4f6', color: t.isActive ? '#085041' : '#6b7280' }} />
                </Box>
                <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>
                  Unit: {t.unit} · Weightage: {t.defaultWeightage}% · {t.checkpoints?.length ?? 0} QC checks
                </Typography>
                {t.isCustom && (
                  <Chip label="Custom" size="small" sx={{ mt: 0.5, fontSize: 9, height: 16, background: '#EBF3FF', color: '#1A56DB' }} />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create new template */}
      <Paper elevation={0} sx={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', p: 3 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 2 }}>Create custom trade</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Trade name *" value={newName} onChange={e => setNewName(e.target.value)} sx={fieldSx} size="small" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField fullWidth label="Unit" value={newUnit} onChange={e => setNewUnit(e.target.value)} sx={fieldSx} size="small" placeholder="nos / sqft" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField fullWidth label="Weightage %" value={newWeight} type="number" onChange={e => setNewWeight(e.target.value)} sx={fieldSx} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Lucide icon name" value={newIcon} onChange={e => setNewIcon(e.target.value)} sx={fieldSx} size="small" placeholder="e.g. Wrench, Paintbrush" />
          </Grid>
        </Grid>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#374151', mb: 1 }}>QC checkpoints</Typography>
        {newCheckpoints.map((c, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField fullWidth value={c} size="small" placeholder={`Checkpoint ${i+1}`}
              onChange={e => { const n=[...newCheckpoints]; n[i]=e.target.value; setNewCheckpoints(n); }} sx={fieldSx} />
            <Button size="small" onClick={() => setNewCheckpoints(p => p.filter((_,j)=>j!==i))}
              sx={{ minWidth: 32, color: '#9ca3af', fontSize: 16 }}>×</Button>
          </Box>
        ))}
        <Button size="small" onClick={() => setNewCheckpoints(p => [...p, ''])}
          sx={{ textTransform: 'none', fontSize: 11, color: '#1A56DB', mb: 2, pl: 0 }}>
          + Add checkpoint
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleCreate} disabled={creating}
            sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 13, boxShadow: 'none' }}>
            {creating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Create trade'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default withAdminLayout(TemplatesPage);

