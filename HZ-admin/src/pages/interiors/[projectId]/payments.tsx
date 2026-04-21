import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import withAdminLayout from '@/src/common/AdminLayout';
import apiClient from '@/src/utils/apiClient';
import toast from 'react-hot-toast';

interface ICustomer {
  id: string;
  fullName: string;
  mobile: string;
}
interface IMilestone {
  id: string;
  milestoneName: string | null;
  amount: number | null;
  status: string | null;
  sortOrder: number | null;
  dueDate?: string | null;
  paidAt?: string | null;
}
interface IProject {
  id: string;
  customerId: string | null;
  customer: ICustomer;
}

const STAGE_LABELS = ['Stage 1 — Booking', 'Stage 2 — 25%', 'Stage 3 — 50%', 'Stage 4 — Handover'];
const STAGE_PCT = ['25%', '35%', '30%', '10%'];

function PaymentsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const { status } = useSession();
  const [project, setProject] = useState<IProject | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dueInputs, setDueInputs] = useState<Record<string, string>>({});
  const [recvInputs, setRecvInputs] = useState<Record<string, string>>({});

  const [changeOpen, setChangeOpen] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [contactOtp, setContactOtp] = useState('');
  const [contactStep, setContactStep] = useState<'idle' | 'sent'>('idle');
  const [contactBusy, setContactBusy] = useState(false);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    if (status !== 'authenticated') return;
    setLoading(true);
    setError('');
    try {
      const base = apiClient.URLS.interiors;
      const [pRes, mRes] = await Promise.all([
        apiClient.get(`${base}/projects/${projectId}`, {}, true),
        apiClient.get(`${base}/projects/${projectId}/milestones`, {}, true),
      ]);
      const p = pRes.body as IProject;
      if (!p?.id) throw new Error('Project not found');
      setProject(p);
      const ms = Array.isArray(mRes.body) ? (mRes.body as IMilestone[]) : [];
      const sorted = [...ms].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const four = [sorted[0], sorted[1], sorted[2], sorted[4]].filter(Boolean) as IMilestone[];
      setMilestones(four.length === 4 ? four : sorted.slice(0, 4));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshMilestones = async () => {
    if (!projectId || typeof projectId !== 'string') return;
    const { body } = await apiClient.get(
      `${apiClient.URLS.interiors}/projects/${projectId}/milestones`,
      {},
      true,
    );
    const ms = Array.isArray(body) ? (body as IMilestone[]) : [];
    const sorted = [...ms].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const four = [sorted[0], sorted[1], sorted[2], sorted[4]].filter(Boolean) as IMilestone[];
    setMilestones(four.length === 4 ? four : sorted.slice(0, 4));
  };

  const patchMilestone = async (
    milestoneId: string,
    action: 'due-date' | 'mark-received' | 'hold' | 'release-hold',
    body: object,
  ) => {
    const base = apiClient.URLS.interiors;
    await apiClient.patch(`${base}/milestones/${milestoneId}/${action}`, body, true);
    toast.success('Updated');
    await refreshMilestones();
  };

  const sendContactOtp = async () => {
    if (!project?.customer?.mobile) return;
    setContactBusy(true);
    try {
      await fetch(`${apiClient.URLS.interiors}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: project.customer.mobile }),
      });
      setContactStep('sent');
      toast.success('OTP sent to current number');
    } catch {
      toast.error('Failed to send OTP');
    } finally {
      setContactBusy(false);
    }
  };

  const submitChangeContact = async () => {
    if (!project?.customer?.id) return;
    setContactBusy(true);
    try {
      await apiClient.patch(
        `${apiClient.URLS.interiors}/customers/${project.customer.id}/change-contact`,
        { newMobile, otp: contactOtp },
        true,
      );
      toast.success('Contact updated');
      setChangeOpen(false);
      setNewMobile('');
      setContactOtp('');
      setContactStep('idle');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setContactBusy(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton height={40} width="40%" sx={{ mb: 2 }} />
        <Skeleton height={120} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    );
  }

  const cust = project.customer;

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto', bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Button
        size="small"
        onClick={() => void router.push(`/interiors/${project.id}`)}
        sx={{ textTransform: 'none', mb: 2, color: '#64748b' }}
      >
        ← Back to project
      </Button>
      <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#0f172a' }}>Payment management</Typography>
      <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.5, mb: 2 }}>
        {cust?.fullName} · Profile ID:{' '}
        <Box component="span" sx={{ fontFamily: 'monospace' }}>
          {cust?.id?.slice(0, 8)}…
        </Box>
      </Typography>

      <Box
        sx={{
          bgcolor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          p: 2,
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#1e40af', flex: '1 1 240px' }}>
          Login number {cust?.mobile ?? '—'} is this customer&apos;s unified ID — used for portal login,
          invoices, and quotations. Changing the number keeps profile ID intact.
        </Typography>
        <Button size="small" variant="contained" onClick={() => setChangeOpen(true)} sx={{ textTransform: 'none' }}>
          Change number
        </Button>
      </Box>

      {changeOpen && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Change contact number</Typography>
          <TextField
            size="small"
            label="New mobile"
            value={newMobile}
            onChange={(e) => setNewMobile(e.target.value)}
            sx={{ mr: 1, mb: 1 }}
          />
          {contactStep === 'idle' && (
            <Button onClick={() => void sendContactOtp()} disabled={contactBusy} sx={{ textTransform: 'none' }}>
              Send OTP (current number)
            </Button>
          )}
          {contactStep === 'sent' && (
            <>
              <TextField
                size="small"
                label="OTP"
                value={contactOtp}
                onChange={(e) => setContactOtp(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button onClick={() => void submitChangeContact()} disabled={contactBusy} sx={{ textTransform: 'none' }}>
                Verify &amp; change
              </Button>
            </>
          )}
          <Button size="small" onClick={() => setChangeOpen(false)} sx={{ ml: 1, textTransform: 'none' }}>
            Cancel
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: '12px',
          mb: 3,
        }}
      >
        {milestones.slice(0, 4).map((m, idx) => {
          const st = m.status ?? 'pending';
          const isPaid = st === 'paid';
          const isHold = st === 'on_hold';
          const isDue = st === 'pending' || st === 'requested';
          const border = isPaid ? '#86efac' : isHold ? '#fca5a5' : isDue ? '#fcd34d' : '#e2e8f0';
          const bg = isPaid ? '#f0fdf4' : isHold ? '#fff1f2' : isDue ? '#fffbeb' : '#fff';
          return (
            <Box
              key={m.id}
              sx={{
                border: `1px solid ${border}`,
                bgcolor: bg,
                borderRadius: '12px',
                p: '14px',
                textAlign: 'center',
                boxShadow: isDue ? '0 0 0 1px rgba(252,211,77,0.35)' : undefined,
                animation: isDue ? 'hb 2.4s ease-in-out infinite' : undefined,
                '@keyframes hb': {
                  '0%,100%': { boxShadow: '0 0 0 0 rgba(252,211,77,0.35)' },
                  '50%': { boxShadow: '0 0 12px 2px rgba(252,211,77,0.45)' },
                },
              }}
            >
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{STAGE_PCT[idx]}</Typography>
              <Typography sx={{ fontSize: 11, color: '#64748b', mb: 1 }}>{STAGE_LABELS[idx]}</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                ₹{Number(m.amount ?? 0).toLocaleString('en-IN')}
              </Typography>
              <Typography sx={{ fontSize: 11, mt: 1, color: '#64748b' }}>{st}</Typography>
              {m.dueDate && (
                <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>
                  Due {new Date(m.dueDate).toLocaleDateString('en-IN')}
                </Typography>
              )}
              <TextField
                size="small"
                type="date"
                label="Set due date"
                InputLabelProps={{ shrink: true }}
                value={dueInputs[m.id] ?? (m.dueDate ? String(m.dueDate).slice(0, 10) : '')}
                onChange={(e) => setDueInputs((s) => ({ ...s, [m.id]: e.target.value }))}
                sx={{ mt: 1, width: '100%' }}
              />
              <Button
                size="small"
                fullWidth
                sx={{ mt: 0.5, textTransform: 'none', fontSize: 11 }}
                onClick={() =>
                  void patchMilestone(m.id, 'due-date', {
                    dueDate: dueInputs[m.id] || (m.dueDate ? String(m.dueDate).slice(0, 10) : ''),
                  })
                }
              >
                Save due date
              </Button>
              {!isPaid && (
                <>
                  <TextField
                    size="small"
                    type="date"
                    label="Date received"
                    InputLabelProps={{ shrink: true }}
                    value={recvInputs[m.id] ?? ''}
                    onChange={(e) => setRecvInputs((s) => ({ ...s, [m.id]: e.target.value }))}
                    sx={{ mt: 1, width: '100%' }}
                  />
                  <Button
                    size="small"
                    fullWidth
                    color="success"
                    sx={{ mt: 0.5, textTransform: 'none', fontSize: 11 }}
                    onClick={() => {
                      const d = recvInputs[m.id];
                      if (!d) {
                        toast.error('Pick date received');
                        return;
                      }
                      void patchMilestone(m.id, 'mark-received', { receivedAt: d });
                    }}
                  >
                    Mark received
                  </Button>
                  {!isHold && (
                    <Button
                      size="small"
                      fullWidth
                      color="error"
                      sx={{ mt: 0.5, textTransform: 'none', fontSize: 11 }}
                      onClick={() => void patchMilestone(m.id, 'hold', {})}
                    >
                      Mark on hold
                    </Button>
                  )}
                  {isHold && (
                    <Button
                      size="small"
                      fullWidth
                      sx={{ mt: 0.5, textTransform: 'none', fontSize: 11, color: '#92400e' }}
                      onClick={() => void patchMilestone(m.id, 'release-hold', {})}
                    >
                      Release hold
                    </Button>
                  )}
                </>
              )}
              {isPaid && (
                <Button size="small" sx={{ mt: 1, textTransform: 'none' }} onClick={() => toast('Receipt download coming soon')}>
                  View receipt
                </Button>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Customer profile</Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{cust?.id}</Typography>
        <Typography sx={{ fontSize: 13, mt: 1 }}>
          {cust?.mobile}{' '}
          <Button size="small" onClick={() => setChangeOpen(true)} sx={{ textTransform: 'none' }}>
            Change
          </Button>
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 0.5 }}>Used on all invoices</Typography>
      </Box>
    </Box>
  );
}

export default withAdminLayout(PaymentsPage);
