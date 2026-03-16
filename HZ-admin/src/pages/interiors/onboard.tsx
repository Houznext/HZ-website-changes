import { useState } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import withAdminLayout from '@/src/common/AdminLayout';

const STEPS = ['Basic details', 'OTP verify', 'Requirements', 'Budget & timeline'];

const SCOPES = [
  'Modular kitchen','Wardrobes','TV unit','False ceiling',
  'Flooring','Painting','Electrical','Plumbing',
  'Bathroom','Pooja unit','Study unit','Shoe rack',
];

const STYLE_OPTIONS = [
  'Modern minimalist','Classic','Contemporary',
  'Industrial','Bohemian','Traditional',
];

const PROPERTY_TYPES = ['Flat / Apartment','Villa','Independent house','Plot'];
const BHK_OPTIONS = ['1 BHK','2 BHK','3 BHK','4 BHK','5 BHK'];

interface FormData {
  fullName: string; mobile: string; email: string;
  city: string; locality: string;
  propertyType: string; totalAreaSqft: string; bhk: string;
  floorNumber: string; address: string; pincode: string;
  scopesSelected: string[]; stylePreference: string;
  totalBudget: string; budgetNote: string;
  expectedStartDate: string; expectedEndDate: string;
  paymentPreference: string; specialNotes: string;
}

function OnboardPage() {
  const router = useRouter();
  const [step, setStep]           = useState(0);
  const [otp, setOtp]             = useState(['','','','','','']);
  const [otpSent, setOtpSent]     = useState(false);
  const [verified, setVerified]   = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [sending, setSending]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [form, setForm] = useState<FormData>({
    fullName: '', mobile: '', email: '',
    city: '', locality: '',
    propertyType: '', totalAreaSqft: '', bhk: '',
    floorNumber: '', address: '', pincode: '',
    scopesSelected: [], stylePreference: '',
    totalBudget: '', budgetNote: '',
    expectedStartDate: '', expectedEndDate: '',
    paymentPreference: 'Milestone based', specialNotes: '',
  });

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';

  const set = (key: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const toggleScope = (s: string) =>
    setForm(f => ({
      ...f,
      scopesSelected: f.scopesSelected.includes(s)
        ? f.scopesSelected.filter(x => x !== s)
        : [...f.scopesSelected, s],
    }));

  const sendOtp = async () => {
    if (!form.mobile || form.mobile.length < 10) {
      setError('Enter a valid 10-digit mobile number'); return;
    }
    setSending(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.mobile }),
      });
      const data = await res.json() as { sent?: boolean; customerId?: string };
      if (!res.ok) throw new Error('Failed to send OTP');
      setOtpSent(true);
      if (data.customerId) setCustomerId(data.customerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.mobile, otp: code }),
      });
      const data = await res.json() as { verified?: boolean; customerId?: string };
      if (!res.ok || !data.verified) throw new Error('Invalid or expired OTP');
      setVerified(true);
      if (data.customerId) setCustomerId(data.customerId);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verification failed');
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i+1}`);
      if (el) (el as HTMLInputElement).focus();
    }
  };

  const submitOnboard = async () => {
    setSubmitting(true); setError('');
    try {
      let cId = customerId;
      if (!cId) {
        const cRes = await fetch(`${API}/interiors/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fullName: form.fullName, mobile: form.mobile, email: form.email, city: form.city, locality: form.locality }),
        });
        if (!cRes.ok) throw new Error('Failed to create customer');
        const cData = await cRes.json() as { id: string };
        cId = cData.id;
      }
      const pRes = await fetch(`${API}/interiors/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerId: cId,
          propertyType: form.propertyType,
          totalAreaSqft: form.totalAreaSqft ? parseInt(form.totalAreaSqft) : null,
          bhk: form.bhk,
          floorNumber: form.floorNumber,
          address: form.address || `${form.locality}, ${form.city}`,
          city: form.city,
          locality: form.locality,
          pincode: form.pincode,
          scopesSelected: form.scopesSelected,
          stylePreference: form.stylePreference,
          totalBudget: form.totalBudget ? parseFloat(form.totalBudget.replace(/,/g, '')) : null,
          budgetNote: form.budgetNote,
          expectedStartDate: form.expectedStartDate || null,
          expectedEndDate: form.expectedEndDate || null,
          paymentPreference: form.paymentPreference,
          specialNotes: form.specialNotes,
        }),
      });
      if (!pRes.ok) throw new Error('Failed to create project');
      const pData = await pRes.json() as { id: string };
      setSuccess(`Project created successfully! ID: ${pData.id}`);
      setTimeout(() => router.push(`/interiors/${pData.id}`), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  const cardSx = {
    background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px', p: 3,
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } };

  return (
    <Box sx={{ background: '#f5f6fa', minHeight: '100vh', p: 3, maxWidth: 760, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111827' }}>
          Onboard new customer
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>
          Complete the steps below to register a customer and create their project
        </Typography>
      </Box>

      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {STEPS.map(s => (
          <Step key={s}>
            <StepLabel sx={{
              '& .MuiStepLabel-label': { fontSize: 12 },
              '& .MuiStepIcon-root.Mui-active': { color: '#1A56DB' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#1D9E75' },
            }}>{s}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>{success}</Alert>}

      {/* ── Step 0: Basic details ── */}
      {step === 0 && (
        <Paper sx={cardSx} elevation={0}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 2 }}>
            Customer basic details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full name *" value={form.fullName}
                onChange={e => set('fullName', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile number *" value={form.mobile}
                onChange={e => set('mobile', e.target.value)} sx={fieldSx} size="small"
                placeholder="10-digit number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email (optional)" value={form.email}
                onChange={e => set('email', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" value={form.city}
                onChange={e => set('city', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Locality" value={form.locality}
                onChange={e => set('locality', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            {!otpSent ? (
              <Button variant="contained" onClick={sendOtp} disabled={sending}
                sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 13, boxShadow: 'none' }}>
                {sending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Send OTP →'}
              </Button>
            ) : (
              <Button variant="contained" onClick={() => setStep(1)}
                sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 13, boxShadow: 'none' }}>
                Next: Verify OTP →
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* ── Step 1: OTP verify ── */}
      {step === 1 && (
        <Paper sx={cardSx} elevation={0}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 1 }}>
            OTP verification
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#6b7280', mb: 2.5 }}>
            Enter the 6-digit code sent to +91 {form.mobile}
          </Typography>
          {verified ? (
            <Alert severity="success" sx={{ borderRadius: '8px', mb: 2 }}>
              Customer verified successfully
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2.5 }}>
                {otp.map((digit, i) => (
                  <TextField key={i} id={`otp-${i}`} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: 18, fontWeight: 500, padding: '10px 0' } }}
                    sx={{
                      width: 48,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': { borderColor: '#1A56DB' },
                      },
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button variant="outlined" size="small" onClick={sendOtp} disabled={sending}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 12, borderColor: '#e5e7eb', color: '#6b7280' }}>
                  Resend OTP
                </Button>
                <Button variant="contained" onClick={verifyOtp} disabled={sending || otp.join('').length !== 6}
                  sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 12, boxShadow: 'none' }}>
                  {sending ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Verify OTP'}
                </Button>
              </Box>
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => setStep(0)} sx={{ textTransform: 'none', fontSize: 12, color: '#6b7280' }}>
              ← Back
            </Button>
            {verified && (
              <Button variant="contained" onClick={() => setStep(2)}
                sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 13, boxShadow: 'none' }}>
                Next: Requirements →
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* ── Step 2: Requirements ── */}
      {step === 2 && (
        <Paper sx={cardSx} elevation={0}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 2 }}>
            Property & interior requirements
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Property type</InputLabel>
                <Select label="Property type" value={form.propertyType}
                  onChange={e => set('propertyType', e.target.value)}>
                  {PROPERTY_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Area (sqft)" value={form.totalAreaSqft}
                onChange={e => set('totalAreaSqft', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>BHK</InputLabel>
                <Select label="BHK" value={form.bhk} onChange={e => set('bhk', e.target.value)}>
                  {BHK_OPTIONS.map(b => <MenuItem key={b} value={b} sx={{ fontSize: 13 }}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Floor number" value={form.floorNumber}
                onChange={e => set('floorNumber', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full address" value={form.address}
                onChange={e => set('address', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField fullWidth label="Pincode" value={form.pincode}
                onChange={e => set('pincode', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#374151', mb: 1 }}>
            Scope of work (select all that apply)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {SCOPES.map(s => (
              <Chip key={s} label={s} size="small" clickable
                onClick={() => toggleScope(s)}
                sx={{
                  fontSize: 11, height: 28,
                  background: form.scopesSelected.includes(s) ? '#EBF3FF' : '#f3f4f6',
                  color: form.scopesSelected.includes(s) ? '#1A56DB' : '#374151',
                  border: `1px solid ${form.scopesSelected.includes(s) ? 'rgba(26,86,219,0.3)' : 'transparent'}`,
                  fontWeight: form.scopesSelected.includes(s) ? 500 : 400,
                  '&:hover': { background: form.scopesSelected.includes(s) ? '#dbeafe' : '#e5e7eb' },
                }}
              />
            ))}
          </Box>

          <FormControl fullWidth size="small" sx={{ ...fieldSx, mb: 0 }}>
            <InputLabel>Style preference</InputLabel>
            <Select label="Style preference" value={form.stylePreference}
              onChange={e => set('stylePreference', e.target.value)}>
              {STYLE_OPTIONS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => setStep(1)} sx={{ textTransform: 'none', fontSize: 12, color: '#6b7280' }}>
              ← Back
            </Button>
            <Button variant="contained" onClick={() => setStep(3)}
              sx={{ background: '#1A56DB', borderRadius: '8px', textTransform: 'none', fontSize: 13, boxShadow: 'none' }}>
              Next: Budget & timeline →
            </Button>
          </Box>
        </Paper>
      )}

      {/* ── Step 3: Budget & timeline ── */}
      {step === 3 && (
        <Paper sx={cardSx} elevation={0}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#111827', mb: 2 }}>
            Budget & timeline
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Total budget (₹)" value={form.totalBudget}
                onChange={e => set('totalBudget', e.target.value)} sx={fieldSx} size="small"
                placeholder="e.g. 1200000" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Budget note (optional)" value={form.budgetNote}
                onChange={e => set('budgetNote', e.target.value)} sx={fieldSx} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Expected start date" type="date"
                value={form.expectedStartDate}
                onChange={e => set('expectedStartDate', e.target.value)}
                sx={fieldSx} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Expected end date" type="date"
                value={form.expectedEndDate}
                onChange={e => set('expectedEndDate', e.target.value)}
                sx={fieldSx} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={fieldSx}>
                <InputLabel>Payment preference</InputLabel>
                <Select label="Payment preference" value={form.paymentPreference}
                  onChange={e => set('paymentPreference', e.target.value)}>
                  <MenuItem value="Milestone based" sx={{ fontSize: 13 }}>Milestone based</MenuItem>
                  <MenuItem value="Monthly"         sx={{ fontSize: 13 }}>Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Special notes (optional)" value={form.specialNotes}
                onChange={e => set('specialNotes', e.target.value)}
                sx={fieldSx} size="small" multiline rows={2} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => setStep(2)} sx={{ textTransform: 'none', fontSize: 12, color: '#6b7280' }}>
              ← Back
            </Button>
            <Button variant="contained" onClick={submitOnboard} disabled={submitting}
              sx={{ background: '#1D9E75', borderRadius: '8px', textTransform: 'none', fontSize: 13, boxShadow: 'none', '&:hover': { background: '#159669' } }}>
              {submitting
                ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                : 'Complete onboarding ✓'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default withAdminLayout(OnboardPage);

