import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Slider from '@mui/material/Slider';
import withAdminLayout from '@/src/common/AdminLayout';

interface ITrade { id: string; customName: string | null; overallProgress: number; template: { name: string } }
interface ILabour { tradeType: string; count: string; hoursWorked: string; wagePerDay: string; }
interface IMaterial { materialName: string; brandName: string; quantity: string; unit: string; unitCost: string; }

function UpdatePage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [trades, setTrades]     = useState<ITrade[]>([]);
  const [tradeId, setTradeId]   = useState('');
  const [status, setStatus]     = useState<string>('in_progress');
  const [currentProg, setCurrent] = useState(0);
  const [delta, setDelta]       = useState(0);
  const [stageLabel, setStage]  = useState('');
  const [workDone, setWorkDone] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [blocker, setBlocker]   = useState('');
  const [labours, setLabours]   = useState<ILabour[]>([{ tradeType: '', count: '', hoursWorked: '', wagePerDay: '' }]);
  const [materials, setMaterials] = useState<IMaterial[]>([{ materialName: '', brandName: '', quantity: '', unit: '', unitCost: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';

  const loadTrades = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { trades?: ITrade[] };
      const t = data.trades ?? [];
      setTrades(t);
      if (t.length > 0) { setTradeId(t[0].id); setCurrent(t[0].overallProgress ?? 0); }
    } catch { /* ignore */ }
  }, [projectId, API]);

  useEffect(() => { loadTrades(); }, [loadTrades]);

  const onTradeChange = (id: string) => {
    setTradeId(id);
    const t = trades.find(x => x.id === id);
    if (t) setCurrent(t.overallProgress ?? 0);
  };

  const newTotal = Math.min(Math.round(currentProg + delta), 100);

  const handleSubmit = async () => {
    if (!tradeId) { setError('Select a trade'); return; }
    setSubmitting(true); setError('');
    try {
      const body = {
        tradeId,
        projectId: projectId as string,
        updateDate: new Date().toISOString().split('T')[0],
        progressDelta: delta,
        cumulativeProgress: newTotal,
        stageLabel: stageLabel || null,
        workDoneToday: workDone || null,
        tomorrowPlan: tomorrow || null,
        blockerNote: blocker || null,
        labourCount: labours.reduce((s, l) => s + (parseInt(l.count) || 0), 0),
        totalExpenditureToday: materials.reduce((s, m) => s + ((parseFloat(m.quantity) || 0) * (parseFloat(m.unitCost) || 0)), 0),
        labourEntries: labours.filter(l => l.tradeType).map(l => ({
          tradeType: l.tradeType,
          count: parseInt(l.count) || 0,
          hoursWorked: parseFloat(l.hoursWorked) || null,
          wagePerDay: parseFloat(l.wagePerDay) || null,
        })),
        materialUsages: materials.filter(m => m.materialName).map(m => ({
          materialName: m.materialName,
          brandName: m.brandName || null,
          quantity: parseFloat(m.quantity) || 0,
          unit: m.unit || 'nos',
          unitCost: parseFloat(m.unitCost) || null,
        })),
      };
      const res = await fetch(`${API}/interiors/trades/${tradeId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to submit update (${res.status})`);
      setSuccess('Update submitted successfully!');
      setTimeout(() => router.push(`/interiors/${projectId as string}`), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const paperSx = {
    background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px', p: 2.5, mb: 2,
  };
  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } };
  const cellSx = { px: 1, py: 0.75, fontSize: 12 };

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3, maxWidth: 800, mx: 'auto' }}>
      <Button onClick={() => router.push(`/interiors/${projectId as string}`)} size="small"
        sx={{ textTransform: 'none', fontSize: 12, color: '#6b7280', mb: 2, pl: 0 }}>
        ← Back to project
      </Button>
      <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111827', mb: 0.5 }}>Daily update</Typography>
      <Typography sx={{ fontSize: 12, color: '#9ca3af', mb: 3 }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

      {/* Trade + status */}
      <Paper sx={paperSx} elevation={0}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827', mb: 2 }}>Trade & status</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Select trade"
            value={tradeId}
            onChange={e => onTradeChange(e.target.value)}
            sx={{ ...fieldSx, minWidth: 220 }}
          >
            {trades.map(t => (
              <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13 }}>
                {t.customName ?? t.template?.name ?? 'Trade'}
              </MenuItem>
            ))}
          </TextField>
          <ToggleButtonGroup size="small" exclusive value={status} onChange={(_, v) => { if (v) setStatus(v); }}>
            <ToggleButton value="in_progress" sx={{ fontSize: 11, textTransform: 'none', borderRadius: '8px 0 0 8px' }}>In progress</ToggleButton>
            <ToggleButton value="on_hold"     sx={{ fontSize: 11, textTransform: 'none', borderRadius: '0 8px 8px 0' }}>On hold</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Progress */}
      <Paper sx={paperSx} elevation={0}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827', mb: 2 }}>Progress</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ background: '#f3f4f6', borderRadius: '8px', px: 2, py: 1, minWidth: 120 }}>
            <Typography sx={{ fontSize: 10, color: '#9ca3af' }}>Current</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111827' }}>{Math.round(currentProg)}%</Typography>
          </Box>
          <Typography sx={{ fontSize: 18, color: '#9ca3af' }}>+</Typography>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 11, color: '#374151', mb: 1 }}>Progress added today: <strong>{delta}%</strong></Typography>
            <Slider value={delta} onChange={(_, v) => setDelta(v as number)} min={0} max={100 - Math.round(currentProg)} step={1}
              sx={{ color: '#1A56DB', '& .MuiSlider-thumb': { width: 16, height: 16 } }} />
          </Box>
          <Box sx={{ background: '#E1F5EE', borderRadius: '8px', px: 2, py: 1, minWidth: 120 }}>
            <Typography sx={{ fontSize: 10, color: '#085041' }}>New total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#085041' }}>{newTotal}%</Typography>
          </Box>
        </Box>
        <TextField fullWidth label="Stage label" value={stageLabel} onChange={e => setStage(e.target.value)}
          placeholder="e.g. Carcass installation done" sx={fieldSx} size="small" />
      </Paper>

      {/* Work notes */}
      <Paper sx={paperSx} elevation={0}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827', mb: 2 }}>Work notes</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField fullWidth label="Work done today" value={workDone} onChange={e => setWorkDone(e.target.value)}
            multiline rows={2} sx={fieldSx} size="small" />
          <TextField fullWidth label="Tomorrow's plan" value={tomorrow} onChange={e => setTomorrow(e.target.value)}
            multiline rows={2} sx={fieldSx} size="small" />
          <TextField fullWidth label="Blocker note" value={blocker} onChange={e => setBlocker(e.target.value)}
            multiline rows={2} sx={fieldSx} size="small"
            placeholder="Any blockers? This will auto-create a snag"
            helperText={blocker ? '⚠ A snag will be created automatically' : ''}
          />
        </Box>
      </Paper>

      {/* Labour table */}
      <Paper sx={paperSx} elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Labour</Typography>
          <Button size="small" onClick={() => setLabours(l => [...l, { tradeType: '', count: '', hoursWorked: '', wagePerDay: '' }])}
            sx={{ fontSize: 11, textTransform: 'none', borderRadius: '6px', border: '1px solid #e5e7eb', color: '#374151' }}>
            + Add row
          </Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Trade type','Count','Hours','Wage/day',''].map(h => (
                <TableCell key={h} sx={{ ...cellSx, color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {labours.map((l, i) => (
              <TableRow key={i}>
                <TableCell sx={cellSx}><TextField size="small" value={l.tradeType} placeholder="Carpenter" onChange={e => { const n=[...labours]; n[i].tradeType=e.target.value; setLabours(n); }} InputProps={{ sx: { fontSize: 12 } }} /></TableCell>
                <TableCell sx={cellSx}><TextField size="small" type="number" value={l.count} placeholder="0" onChange={e => { const n=[...labours]; n[i].count=e.target.value; setLabours(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 70 }} /></TableCell>
                <TableCell sx={cellSx}><TextField size="small" type="number" value={l.hoursWorked} placeholder="8" onChange={e => { const n=[...labours]; n[i].hoursWorked=e.target.value; setLabours(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 70 }} /></TableCell>
                <TableCell sx={cellSx}><TextField size="small" type="number" value={l.wagePerDay} placeholder="0" onChange={e => { const n=[...labours]; n[i].wagePerDay=e.target.value; setLabours(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 90 }} /></TableCell>
                <TableCell sx={cellSx}><IconButton size="small" onClick={() => setLabours(l => l.filter((_, j) => j !== i))} sx={{ color: '#9ca3af' }}><span style={{ fontSize: 16 }}>×</span></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Materials table */}
      <Paper sx={paperSx} elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Materials used</Typography>
          <Button size="small" onClick={() => setMaterials(m => [...m, { materialName: '', brandName: '', quantity: '', unit: '', unitCost: '' }])}
            sx={{ fontSize: 11, textTransform: 'none', borderRadius: '6px', border: '1px solid #e5e7eb', color: '#374151' }}>
            + Add row
          </Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Material','Brand','Qty','Unit','Cost/unit','Total',''].map(h => (
                <TableCell key={h} sx={{ ...cellSx, color: '#9ca3af', fontWeight: 500, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.map((m, i) => {
              const total = (parseFloat(m.quantity)||0) * (parseFloat(m.unitCost)||0);
              return (
                <TableRow key={i}>
                  <TableCell sx={cellSx}><TextField size="small" value={m.materialName} placeholder="Plywood" onChange={e => { const n=[...materials]; n[i].materialName=e.target.value; setMaterials(n); }} InputProps={{ sx: { fontSize: 12 } }} /></TableCell>
                  <TableCell sx={cellSx}><TextField size="small" value={m.brandName} placeholder="Greenply" onChange={e => { const n=[...materials]; n[i].brandName=e.target.value; setMaterials(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 90 }} /></TableCell>
                  <TableCell sx={cellSx}><TextField size="small" type="number" value={m.quantity} onChange={e => { const n=[...materials]; n[i].quantity=e.target.value; setMaterials(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 70 }} /></TableCell>
                  <TableCell sx={cellSx}><TextField size="small" value={m.unit} placeholder="sheets" onChange={e => { const n=[...materials]; n[i].unit=e.target.value; setMaterials(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 70 }} /></TableCell>
                  <TableCell sx={cellSx}><TextField size="small" type="number" value={m.unitCost} onChange={e => { const n=[...materials]; n[i].unitCost=e.target.value; setMaterials(n); }} InputProps={{ sx: { fontSize: 12 } }} sx={{ width: 90 }} /></TableCell>
                  <TableCell sx={{ ...cellSx, color: '#374151', fontWeight: 500 }}>
                    {total > 0 ? `₹${total.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell sx={cellSx}><IconButton size="small" onClick={() => setMaterials(m => m.filter((_,j) => j !== i))} sx={{ color: '#9ca3af' }}><span style={{ fontSize: 16 }}>×</span></IconButton></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Submit */}
      <Button fullWidth variant="contained" onClick={handleSubmit} disabled={submitting}
        sx={{ background: '#1D9E75', borderRadius: '10px', textTransform: 'none', fontSize: 14, fontWeight: 500, py: 1.5, boxShadow: 'none', '&:hover': { background: '#159669', boxShadow: 'none' } }}>
        {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit daily update'}
      </Button>
    </Box>
  );
}

export default withAdminLayout(UpdatePage);

