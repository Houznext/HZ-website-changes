import { useEffect, useState } from 'react';
import { Eye, MessageSquare, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import withLivebuildLayout from '@/src/common/LivebuildAdminLayout';
import livebuildApi from '@/src/livebuild/lib/api';
import type { LbCustomer } from '@/src/livebuild/lib/types';
import {
  Badge,
  Btn,
  LiveBuildPageHeader,
  Modal,
  Table,
  FormInput,
  Label,
  lbToast,
} from '@/src/livebuild/components';
import { useLbStickyTop } from '@/src/livebuild/hooks/useLbStickyTop';
import Loader from '@/src/common/Loader';

function LiveBuildCustomersPage() {
  useLbStickyTop();
  const router = useRouter();
  const [customers, setCustomers] = useState<LbCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await livebuildApi.listCustomers();
      setCustomers(Array.isArray(list) ? list : []);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load customers', 'err');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCustomer = async () => {
    if (!fullName.trim() || !verified) {
      lbToast('Verify mobile OTP first', 'err');
      return;
    }
    try {
      await livebuildApi.createCustomer({
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, '').slice(-10),
        email: email || undefined,
        otpToken,
      });
      lbToast('Customer added', 'ok');
      setModalOpen(false);
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to add customer', 'err');
    }
  };

  return (
    <div className="lb-page">
      <LiveBuildPageHeader
        title="Customers"
        actions={
          <Btn variant="blue" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={12} strokeWidth={2.5} />
            Add customer
          </Btn>
        }
      />
      <div className="lb-content">
        {loading ? (
          <div className="lb-loading">
            <Loader />
          </div>
        ) : (
          <div className="lb-card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              headers={[
                'Customer',
                'Contact',
                'Projects',
                'Active project',
                'Overall progress',
                'Queries',
              ]}
            >
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--lb-blue)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: 'var(--lb-m)',
                        }}
                      >
                        {c.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{c.fullName}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    <div>{c.phone}</div>
                    {c.email ? (
                      <div style={{ color: 'var(--lb-mu)', fontSize: 11 }}>{c.email}</div>
                    ) : null}
                  </td>
                  <td>
                    <Badge variant="gray">
                      {c.projectCount ?? 0} project{(c.projectCount ?? 0) !== 1 ? 's' : ''}
                    </Badge>
                  </td>
                  <td>{c.activeProjectName || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                      <div className="lb-prog-track" style={{ flex: 1 }}>
                        <div
                          className="lb-prog-fill"
                          style={{
                            width: `${c.overallProgressPct ?? 0}%`,
                            background: 'var(--lb-blue)',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--lb-m)',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {c.overallProgressPct ?? 0}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {(c.openQueries ?? 0) > 0 ? (
                      <Badge variant="amber">{c.openQueries} open</Badge>
                    ) : (
                      <Badge variant="tl">None</Badge>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Btn
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          if (c.activeProjectId) {
                            router.push(`/livebuild/projects/${c.activeProjectId}`);
                          } else {
                            lbToast('No active project', 'info');
                          }
                        }}
                        aria-label="View project"
                      >
                        <Eye size={12} />
                      </Btn>
                      <Btn
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          if (c.activeProjectId) {
                            router.push(
                              `/livebuild/projects/${c.activeProjectId}?tab=queries`,
                            );
                          } else {
                            lbToast('No project for queries', 'info');
                          }
                        }}
                        aria-label="Message"
                      >
                        <MessageSquare size={12} />
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
            {customers.length === 0 ? (
              <div className="lb-empty">No customers yet</div>
            ) : null}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add customer"
        footer={
          <>
            <Btn variant="blue" onClick={addCustomer}>
              Add customer
            </Btn>
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Btn>
          </>
        }
        icon={<Users size={16} strokeWidth={1.8} />}
      >
        <div className="lb-form-row" style={{ marginBottom: 12 }}>
          <div>
            <Label required>Full name</Label>
            <FormInput value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg,#f0f7ff,#e8f1fd)',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: '13px 14px',
          }}
        >
          <div className="lb-form-row">
            <div>
              <Label required>Mobile</Label>
              <div style={{ display: 'flex', gap: 7 }}>
                <FormInput value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flex: 1 }} />
                <Btn
                  variant="blue"
                  size="sm"
                  onClick={async () => {
                    const p = phone.replace(/\D/g, '').slice(-10);
                    await livebuildApi.sendCustomerOtp(p);
                    lbToast('OTP sent', 'ok');
                  }}
                >
                  Send OTP
                </Btn>
              </div>
            </div>
            <div>
              <Label required>Verify OTP</Label>
              <div style={{ display: 'flex', gap: 7 }}>
                <FormInput value={otp} onChange={(e) => setOtp(e.target.value)} style={{ flex: 1 }} />
                <Btn
                  variant="tl"
                  size="sm"
                  onClick={async () => {
                    const p = phone.replace(/\D/g, '').slice(-10);
                    const res = await livebuildApi.verifyCustomerOtp(p, otp);
                    setVerified(res.verified);
                    setOtpToken(res.otpToken);
                    lbToast(res.verified ? 'Verified' : 'Invalid OTP', res.verified ? 'ok' : 'err');
                  }}
                >
                  Verify
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withLivebuildLayout(LiveBuildCustomersPage);
