import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Package,
  TrendingUp,
} from 'lucide-react';
import type { LbCustomer, LbProjectDetail, LbProgressMethod, LbTeamMember } from '../lib/types';
import {
  LB_PHASES,
  LB_PROJECT_STATUSES,
  LB_PROPERTY_TYPES,
  LB_PROJECT_TYPES,
  avatarColor,
  customerInitials,
} from '../lib/constants';
import {
  Badge,
  Btn,
  FormInput,
  Label,
  ProgressRing,
  SectionDivider,
  lbToast,
} from '../components';
import livebuildApi from '../lib/api';

function projectMobile10(p: LbProjectDetail): string {
  const raw = p.customerMobile ?? p.customer?.phone ?? '';
  return raw.replace(/\D/g, '').slice(-10);
}

function formatMobileDisplay(p: LbProjectDetail): string {
  const ten = projectMobile10(p);
  if (ten.length !== 10) return p.customerMobile ?? '—';
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}

type Props = {
  project: LbProjectDetail;
  onUpdated: (p: LbProjectDetail) => void;
  onSwitchTab?: (tab: string) => void;
};

export function ProjectOverviewTab({ project, onUpdated, onSwitchTab }: Props) {
  const [form, setForm] = useState(project);
  const [method, setMethod] = useState<LbProgressMethod>(
    (project.progressMethod as LbProgressMethod) || 'hybrid',
  );
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<LbCustomer[]>([]);
  const [team, setTeam] = useState<LbTeamMember[]>([]);
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileOtpToken, setMobileOtpToken] = useState<string | undefined>();
  const [mobileOtpStatus, setMobileOtpStatus] = useState(
    'Send OTP to verify the mobile number',
  );
  const [mobileSaving, setMobileSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const stats = project.stats;
  const hasMobile = projectMobile10(project).length === 10;
  const mobileUnchanged =
    hasMobile && mobilePhone.replace(/\D/g, '').slice(-10) === projectMobile10(project);

  useEffect(() => {
    livebuildApi.listCustomers().then(setCustomers).catch(() => setCustomers([]));
    livebuildApi.listTeam().then(setTeam).catch(() => setTeam([]));
  }, []);

  useEffect(() => {
    setForm(project);
    setMethod((project.progressMethod as LbProgressMethod) || 'hybrid');
  }, [project]);

  useEffect(() => {
    const ten = projectMobile10(project);
    setMobilePhone(ten.length === 10 ? ten : '');
    setMobileOtp('');
    setMobileVerified(false);
    setMobileOtpToken(undefined);
    setMobileOtpStatus(
      ten.length === 10
        ? 'Change number below and verify with OTP'
        : 'Enter mobile and verify with OTP to link LiveBuild portal login',
    );
  }, [project.id, project.customerMobile, project.customer?.phone]);

  const displayPct =
    form.progressOverridePct != null ? form.progressOverridePct : project.progressPct;

  const sendMobileOtp = async () => {
    const p = mobilePhone.replace(/\D/g, '').slice(-10);
    if (p.length !== 10) {
      lbToast('Enter a valid 10-digit mobile number', 'err');
      return;
    }
    if (hasMobile && p === projectMobile10(project)) {
      lbToast('Enter a different mobile number to change', 'err');
      return;
    }
    try {
      await livebuildApi.sendCustomerOtp(p);
      setMobileVerified(false);
      setMobileOtpToken(undefined);
      setMobileOtpStatus('OTP sent — check SMS');
      lbToast('OTP sent', 'ok');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to send OTP', 'err');
    }
  };

  const verifyMobileOtp = async () => {
    const p = mobilePhone.replace(/\D/g, '').slice(-10);
    if (!mobileOtp.trim()) {
      lbToast('Enter OTP', 'err');
      return;
    }
    try {
      const res = await livebuildApi.verifyCustomerOtp(p, mobileOtp.trim());
      if (res.verified) {
        setMobileVerified(true);
        setMobileOtpToken(res.otpToken);
        setMobileOtpStatus('✓ Mobile verified');
        lbToast('Mobile verified', 'ok');
      } else {
        lbToast('Invalid OTP', 'err');
      }
    } catch (e: any) {
      lbToast(e?.body?.message || 'Verification failed', 'err');
    }
  };

  const saveCustomerMobile = async () => {
    const p = mobilePhone.replace(/\D/g, '').slice(-10);
    if (p.length !== 10) {
      lbToast('Enter a valid 10-digit mobile number', 'err');
      return;
    }
    if (hasMobile && p === projectMobile10(project)) {
      lbToast('This is already the project mobile number', 'err');
      return;
    }
    if (!mobileVerified || !mobileOtpToken) {
      lbToast('Verify the mobile number with OTP first', 'err');
      return;
    }
    setMobileSaving(true);
    try {
      const updated = await livebuildApi.updateProjectCustomerMobile(project.id, {
        phone: p,
        otpVerifiedToken: mobileOtpToken,
      });
      onUpdated(updated);
      setForm((f) => ({ ...f, customerMobile: updated.customerMobile }));
      lbToast(hasMobile ? 'Mobile number updated' : 'Mobile number linked', 'ok');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to update mobile', 'err');
    } finally {
      setMobileSaving(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await livebuildApi.updateProject(project.id, {
        name: form.name,
        propertyType: form.propertyType,
        projectType: form.projectType,
        startDate: form.startDate,
        dueDate: form.dueDate,
        address: form.address ?? form.location,
        siteManager: form.siteManagerName ?? undefined,
        customerId: form.customerId ? Number(form.customerId) : null,
        panoramaUrl: form.panoramaUrl ?? null,
        progressMethod: method,
        progressOverridePct: form.progressOverridePct ?? null,
        progressOverrideReason: form.progressOverrideReason ?? null,
        phase: form.phase,
        status: form.status,
        onHoldReason: form.onHoldReason ?? null,
      });
      onUpdated(updated);
      lbToast('Project saved', 'ok');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    setCoverUploading(true);
    try {
      const res = await livebuildApi.uploadProjectCover(project.id, file);
      setForm((f) => ({ ...f, coverImageUrl: res.coverImageUrl }));
      onUpdated({ ...project, coverImageUrl: res.coverImageUrl });
      lbToast('Cover image updated', 'ok');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Cover upload failed', 'err');
    } finally {
      setCoverUploading(false);
    }
  };

  const phaseIdx = LB_PHASES.indexOf((form.phase ?? 'Design') as (typeof LB_PHASES)[number]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 18,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="lb-card lb-fa">
          <SectionDivider
            title="Project details"
            hint="Click any field to edit"
            icon={<FileText size={13} strokeWidth={1.8} color="var(--lb-blue)" />}
          />
          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label required>Project name</Label>
              <FormInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label required>Project code</Label>
              <FormInput value={form.code} readOnly />
            </div>
          </div>
          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label required>Customer</Label>
              <FormInput
                as="select"
                value={form.customerId ?? ''}
                onChange={(e) => {
                  const c = customers.find((x) => x.id === e.target.value);
                  setForm({
                    ...form,
                    customerId: e.target.value,
                    customerName: c?.fullName ?? form.customerName,
                    customer: c,
                  });
                }}
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </FormInput>
            </div>
            <div>
              <Label>Property type</Label>
              <FormInput
                as="select"
                value={form.propertyType ?? ''}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              >
                <option value="">—</option>
                {LB_PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FormInput>
            </div>
          </div>
          <div
            style={{
              marginBottom: 12,
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--lb-bd)',
              background: 'var(--lb-sf2)',
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <Label required={!hasMobile}>
                Customer mobile (LiveBuild portal)
              </Label>
              {hasMobile ? (
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: 'var(--lb-m)',
                    marginTop: 4,
                  }}
                >
                  {formatMobileDisplay(project)}
                </div>
              ) : null}
              <div style={{ fontSize: 11, color: 'var(--lb-mu)', marginTop: 4 }}>
                {hasMobile
                  ? 'This number is used for the customer website LiveBuild login. It cannot be removed — only changed after OTP verification on the new number.'
                  : 'Links this project to the customer website LiveBuild portal. OTP verification is required.'}
              </div>
            </div>
            <div className="lb-form-row" style={{ marginBottom: 10 }}>
              <div>
                <Label>{hasMobile ? 'New mobile number' : 'Mobile number'}</Label>
                <div style={{ display: 'flex', gap: 7 }}>
                  <FormInput
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={mobilePhone}
                    onChange={(e) => {
                      setMobilePhone(e.target.value);
                      setMobileVerified(false);
                      setMobileOtpToken(undefined);
                      setMobileOtpStatus('Send OTP after entering the number');
                    }}
                    style={{ flex: 1 }}
                  />
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={sendMobileOtp}
                    style={{ flexShrink: 0 }}
                    disabled={mobileUnchanged}
                  >
                    Send OTP
                  </Btn>
                </div>
              </div>
              <div>
                <Label>OTP verification</Label>
                <div style={{ display: 'flex', gap: 7 }}>
                  <FormInput
                    placeholder="6-digit OTP"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    style={{
                      flex: 1,
                      letterSpacing: '0.15em',
                      fontFamily: 'var(--lb-m)',
                    }}
                  />
                  <Btn
                    variant="tl"
                    size="sm"
                    onClick={verifyMobileOtp}
                    style={{ flexShrink: 0 }}
                    disabled={mobileUnchanged}
                  >
                    Verify
                  </Btn>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    color: mobileVerified ? 'var(--lb-tl)' : 'var(--lb-mu)',
                  }}
                >
                  {mobileOtpStatus}
                </div>
              </div>
            </div>
            <Btn
              variant="tl"
              size="sm"
              onClick={saveCustomerMobile}
              disabled={
                mobileSaving ||
                mobileUnchanged ||
                !mobileVerified ||
                !mobileOtpToken
              }
            >
              {mobileSaving
                ? 'Saving…'
                : hasMobile
                  ? 'Save new mobile'
                  : 'Link mobile to project'}
            </Btn>
          </div>
          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label>Project type</Label>
              <FormInput
                as="select"
                value={form.projectType ?? ''}
                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
              >
                <option value="">—</option>
                {LB_PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FormInput>
            </div>
            <div>
              <Label>Site manager</Label>
              <FormInput
                as="select"
                value={form.siteManagerName ?? ''}
                onChange={(e) => setForm({ ...form, siteManagerName: e.target.value })}
              >
                <option value="">—</option>
                {team.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </FormInput>
            </div>
          </div>
          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label required>Start date</Label>
              <FormInput
                type="date"
                value={form.startDate?.slice(0, 10) ?? ''}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label required>Due date</Label>
              <FormInput
                type="date"
                value={form.dueDate?.slice(0, 10) ?? ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Address / location</Label>
            <FormInput
              value={form.address ?? form.location ?? ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <Btn variant="blue" size="sm" style={{ marginTop: 12 }} onClick={save} disabled={saving}>
            Save details
          </Btn>
        </div>

        <div className="lb-card lb-fa lb-fa2">
          <SectionDivider
            title="Timeline & phase"
            icon={<TrendingUp size={13} strokeWidth={1.8} color="var(--lb-tl)" />}
            iconBg="#d1fae5"
          />
          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label>Current phase</Label>
              <FormInput
                as="select"
                value={form.phase ?? 'Design'}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
              >
                {LB_PHASES.map((ph) => (
                  <option key={ph} value={ph}>
                    {ph}
                  </option>
                ))}
              </FormInput>
            </div>
            <div>
              <Label>Project status</Label>
              <FormInput
                as="select"
                value={form.status ?? 'in_progress'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {LB_PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </FormInput>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Label>On-hold reason (if on hold)</Label>
            <FormInput
              as="textarea"
              rows={2}
              placeholder="Reason for hold — visible to customer"
              value={form.onHoldReason ?? ''}
              onChange={(e) => setForm({ ...form, onHoldReason: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
            {LB_PHASES.map((ph, i) => (
              <div
                key={ph}
                style={{
                  flex: 1,
                  minWidth: 56,
                  textAlign: 'center',
                  padding: '6px 4px',
                  borderRadius: 8,
                  fontSize: 9.5,
                  fontWeight: 700,
                  fontFamily: 'var(--lb-m)',
                  background: i <= phaseIdx ? 'var(--lb-blue)' : 'var(--lb-off)',
                  color: i <= phaseIdx ? '#fff' : 'var(--lb-mu)',
                }}
              >
                {ph}
              </div>
            ))}
          </div>
        </div>

        <div className="lb-card lb-fa lb-fa3">
          <SectionDivider
            title="Progress calculation method"
            icon={<TrendingUp size={13} strokeWidth={1.8} color="var(--lb-am)" />}
            iconBg="#fef3c7"
          />
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f7ff, #e8f1fd)',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              padding: '13px 16px',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--lb-m)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--lb-blue)',
                marginBottom: 5,
              }}
            >
              Recommendation: Hybrid method
            </div>
            <div style={{ fontSize: 12, color: 'var(--lb-ch)', lineHeight: 1.6 }}>
              Auto-calculates from completed items per room. Admin can override with a reason if
              needed.
            </div>
          </div>
          <div className="lb-g3">
            {(
              [
                { id: 'hybrid' as const, title: 'Hybrid (recommended)', desc: 'Auto + override.' },
                { id: 'items' as const, title: 'Item completion', desc: 'Items per room.' },
                { id: 'manual' as const, title: 'Manual entry', desc: 'Admin enters %.' },
              ] as const
            ).map((m) => (
              <div
                key={m.id}
                className={`lb-pct-method ${method === m.id ? 'sel' : ''}`}
                onClick={() => setMethod(m.id)}
                role="button"
                tabIndex={0}
              >
                <div style={{ fontFamily: 'var(--lb-m)', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>{m.desc}</div>
              </div>
            ))}
          </div>
          {method !== 'items' ? (
            <div
              style={{
                marginTop: 14,
                padding: '12px 14px',
                background: 'var(--lb-off)',
                borderRadius: 10,
              }}
            >
              <div style={{ fontFamily: 'var(--lb-m)', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                Override progress %
              </div>
              <div className="lb-form-row">
                <div>
                  <Label>
                    Override %{' '}
                    <span style={{ color: 'var(--lb-mu)', fontWeight: 400, textTransform: 'none', fontSize: 10 }}>
                      (leave blank to use auto)
                    </span>
                  </Label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FormInput
                      type="number"
                      min={0}
                      max={100}
                      style={{ width: 100 }}
                      value={form.progressOverridePct ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          progressOverridePct: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                    <div className="lb-prog-track" style={{ flex: 1, height: 7 }}>
                      <div
                        className="lb-prog-fill"
                        style={{ width: `${displayPct}%`, background: 'var(--lb-blue)' }}
                      />
                    </div>
                    <span style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700 }}>
                      {displayPct}%
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Override reason</Label>
                  <FormInput
                    value={form.progressOverrideReason ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, progressOverrideReason: e.target.value })
                    }
                    placeholder="e.g. On-hold days excluded"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 128 }}>
        <div className="lb-card">
          <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            Customer portal media
          </div>
          <div
            style={{
              height: 120,
              borderRadius: 10,
              marginBottom: 10,
              background: form.coverImageUrl
                ? `url(${form.coverImageUrl}) center/cover no-repeat`
                : 'linear-gradient(135deg, var(--lb-navy), var(--lb-blue))',
            }}
          />
          <label className="lb-dpr-upload" style={{ display: 'block', marginBottom: 10 }}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              disabled={coverUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadCover(f);
                e.target.value = '';
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lb-ch)' }}>
              {coverUploading ? 'Uploading cover…' : 'Upload dashboard cover image'}
            </div>
          </label>
          <Label>3D panorama URL</Label>
          <FormInput
            placeholder="https://… (Matterport or 360° tour)"
            value={form.panoramaUrl ?? ''}
            onChange={(e) => setForm({ ...form, panoramaUrl: e.target.value })}
          />
        </div>

        <div className="lb-card">
          <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
            Progress summary
          </div>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <ProgressRing pct={project.progressPct} size={80} />
          </div>
          <Badge variant="prog">{form.phase || project.status}</Badge>
          {stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, marginTop: 14 }}>
              {[
                ['Days elapsed', `${stats.daysElapsed} / ${stats.totalDays}`],
                ['Rooms completed', `${stats.roomsCompleted} / ${stats.roomsTotal}`],
                ['Work types active', String(stats.workTypesActive)],
                ['Photos today', String(stats.photosToday)],
                ['Open queries', String(stats.openQueries)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--lb-mu)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {onSwitchTab ? (
          <div className="lb-card">
            <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              Quick links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { tab: 'rooms', label: 'Rooms & Progress', icon: Home, accent: false },
                { tab: 'dpr', label: 'Upload DPR', icon: CalendarCheck, accent: true },
                { tab: 'payments', label: 'Payments', icon: CreditCard, accent: false },
                { tab: 'queries', label: 'Queries', icon: MessageSquare, accent: false },
                { tab: 'property-info', label: 'Property Info', icon: Home, accent: false },
                { tab: 'documents', label: 'Documents', icon: FileText, accent: false },
                { tab: 'materials', label: 'Materials & BOQ', icon: Package, accent: false },
              ].map((l) => (
                <button
                  key={l.tab}
                  type="button"
                  className={l.accent ? 'lb-btn lb-btn-sm' : 'lb-quick-link'}
                  style={
                    l.accent
                      ? {
                          width: '100%',
                          justifyContent: 'flex-start',
                          gap: 8,
                          background: 'linear-gradient(135deg, var(--lb-accent), #e8751a)',
                          color: '#fff',
                          fontWeight: 800,
                        }
                      : { width: '100%', justifyContent: 'flex-start', gap: 8 }
                  }
                  onClick={() => onSwitchTab?.(l.tab)}
                >
                  <l.icon size={13} strokeWidth={l.accent ? 2 : 1.8} />
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {project.customer ? (
          <div className="lb-card">
            <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              Customer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${avatarColor(project.customer.fullName)}, var(--lb-bh))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--lb-m)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {customerInitials(project.customer.fullName)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{project.customer.fullName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>{project.customer.phone}</div>
              </div>
            </div>
            <Link href="/livebuild/customers">
              <Btn variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                View customer profile
              </Btn>
            </Link>
          </div>
        ) : null}

        {(project.attention ?? []).length > 0 ? (
          <div className="lb-card" style={{ background: '#fff8f3', borderColor: '#fcd9b0' }}>
            <div
              style={{
                fontFamily: 'var(--lb-m)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--lb-accent)',
                marginBottom: 8,
              }}
            >
              ⚠ Attention needed
            </div>
            <div style={{ fontSize: 12, color: '#7c3303', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {project.attention!.map((a, i) => (
                <div key={i}>• {a}</div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
