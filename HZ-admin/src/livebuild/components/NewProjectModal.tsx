import { useEffect, useState } from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Modal } from './Modal';
import { Btn } from './Btn';
import { Label } from './Label';
import { FormInput } from './FormInput';
import { lbToast } from './Toast';
import { PropertyInfoFormFields } from './PropertyInfoFormFields';
import livebuildApi from '../lib/api';
import { LB_PROPERTY_TYPES } from '../lib/constants';
import { buildPropertyInfoPayload, emptyPropertyInfo } from '../lib/propertyInfoConfig';
import type { CreateProjectPayload, LbPropertyInfo } from '../lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
};

export function NewProjectModal({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [codePreview, setCodePreview] = useState('—');
  const [name, setName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('Enter mobile number and send OTP first');
  const [otpToken, setOtpToken] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);
  const [propertyType, setPropertyType] = useState<string>(LB_PROPERTY_TYPES[0]);
  const [projectType, setProjectType] = useState('Interior');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [address, setAddress] = useState('');
  const [propertyInfo, setPropertyInfo] = useState<LbPropertyInfo>(emptyPropertyInfo());
  const [scopeInput, setScopeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    livebuildApi
      .getNextProjectCode()
      .then((r) => setCodePreview(r.code))
      .catch(() => setCodePreview('HZLB-????'));
  }, [open]);

  const reset = () => {
    setStep(1);
    setName('');
    setCustomerName('');
    setPhone('');
    setOtp('');
    setOtpStatus('Enter mobile number and send OTP first');
    setOtpToken(undefined);
    setVerified(false);
    setPropertyType(LB_PROPERTY_TYPES[0]);
    setStartDate('');
    setDueDate('');
    setAddress('');
    setPropertyInfo(emptyPropertyInfo());
    setScopeInput('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const sendOtp = async () => {
    const p = phone.replace(/\D/g, '').slice(-10);
    if (p.length !== 10) {
      lbToast('Enter a valid 10-digit mobile number', 'err');
      return;
    }
    try {
      await livebuildApi.sendCustomerOtp(p);
      setOtpStatus('OTP sent — check SMS');
      lbToast('OTP sent', 'ok');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to send OTP', 'err');
    }
  };

  const verifyOtp = async () => {
    const p = phone.replace(/\D/g, '').slice(-10);
    if (!otp.trim()) {
      lbToast('Enter OTP', 'err');
      return;
    }
    try {
      const res = await livebuildApi.verifyCustomerOtp(p, otp.trim());
      if (res.verified) {
        setVerified(true);
        setOtpToken(res.otpToken);
        setOtpStatus('✓ Mobile verified');
        lbToast('Mobile verified', 'ok');
      } else {
        lbToast('Invalid OTP', 'err');
      }
    } catch (e: any) {
      lbToast(e?.body?.message || 'Verification failed', 'err');
    }
  };

  const validateStep1 = () => {
    if (!name.trim() || !customerName.trim() || !startDate || !dueDate) {
      lbToast('Fill required fields', 'err');
      return false;
    }
    if (!verified) {
      lbToast('Verify customer mobile with OTP first', 'err');
      return false;
    }
    return true;
  };

  const goToStep2 = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const create = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    let createdProjectId: string | null = null;
    try {
      const mobile10 = phone.replace(/\D/g, '').slice(-10);
      const payload: CreateProjectPayload = {
        name: name.trim(),
        customerFullName: customerName.trim(),
        customerPhone: mobile10,
        customerMobile: `+91${mobile10}`,
        propertyType,
        projectType,
        startDate,
        dueDate,
        address: address.trim() || undefined,
        otpVerifiedToken: otpToken,
      };
      const project = await livebuildApi.createProject(payload);
      createdProjectId = project.id;
      try {
        await livebuildApi.upsertPropertyInfo(project.id, buildPropertyInfoPayload(propertyInfo));
      } catch (propErr: any) {
        try {
          await livebuildApi.deleteProject(project.id);
        } catch {
          /* best-effort rollback */
        }
        lbToast(
          propErr?.body?.message ||
            'Property details could not be saved. Project creation was rolled back — please try again.',
          'err',
        );
        return;
      }
      lbToast('Project created', 'ok');
      handleClose();
      onCreated(project.id);
    } catch (e: any) {
      if (createdProjectId) {
        try {
          await livebuildApi.deleteProject(createdProjectId);
        } catch {
          /* ignore */
        }
      }
      lbToast(e?.body?.message || 'Failed to create project', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? 'Create new project' : 'Property details'}
      subtitle={
        step === 1
          ? 'Step 1 of 2 — project basics'
          : `Step 2 of 2 — ${propertyType} details (optional but recommended)`
      }
      maxWidth={step === 1 ? 640 : 720}
      icon={
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--lb-blue), var(--lb-bh))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Home size={16} strokeWidth={1.8} color="#fff" />
        </div>
      }
      footer={
        step === 1 ? (
          <>
            <Btn variant="blue" onClick={goToStep2}>
              Next — property details
            </Btn>
            <Btn variant="ghost" onClick={handleClose}>
              Cancel
            </Btn>
          </>
        ) : (
          <>
            <Btn variant="blue" onClick={create} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create project'}
            </Btn>
            <Btn variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
              <ChevronLeft size={14} />
              Back
            </Btn>
          </>
        )
      }
    >
      {step === 1 ? (
        <>
          <div
            style={{
              background: 'var(--lb-off)',
              borderRadius: 9,
              padding: '10px 14px',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid var(--lb-brd)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--lb-mu)' }}>Project code will be auto-assigned:</span>
            <span style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 800, color: 'var(--lb-blue)' }}>
              {codePreview}
            </span>
          </div>

          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label required>Project name</Label>
              <FormInput placeholder="e.g. 2BHK Modern Flat" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label required>Customer full name</Label>
              <FormInput
                placeholder="Type customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label required>Customer mobile number</Label>
              <div style={{ display: 'flex', gap: 7 }}>
                <FormInput
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Btn variant="ghost" size="sm" onClick={sendOtp} style={{ flexShrink: 0 }}>
                  Send OTP
                </Btn>
              </div>
              <div style={{ fontSize: 11, color: 'var(--lb-mu)', marginTop: 4 }}>
                Used for customer LiveBuild portal login
              </div>
            </div>
            <div>
              <Label required>OTP verification</Label>
              <div style={{ display: 'flex', gap: 7 }}>
                <FormInput
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ flex: 1, letterSpacing: '0.15em', fontFamily: 'var(--lb-m)' }}
                />
                <Btn variant="tl" size="sm" onClick={verifyOtp} style={{ flexShrink: 0 }}>
                  Verify
                </Btn>
              </div>
              <div style={{ fontSize: 11, marginTop: 4, color: verified ? 'var(--lb-tl)' : 'var(--lb-mu)' }}>
                {otpStatus}
              </div>
            </div>
          </div>

          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label>Property type</Label>
              <FormInput as="select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                {LB_PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </FormInput>
            </div>
            <div>
              <Label>Project type</Label>
              <FormInput as="select" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                <option>Interior</option>
                <option>Renovation</option>
                <option>Construction</option>
              </FormInput>
            </div>
          </div>

          <div className="lb-form-row" style={{ marginBottom: 12 }}>
            <div>
              <Label required>Start date</Label>
              <FormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label required>Due date</Label>
              <FormInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <FormInput placeholder="Site address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </>
      ) : (
        <PropertyInfoFormFields
          propertyType={propertyType}
          form={propertyInfo}
          setForm={setPropertyInfo}
          scopeInput={scopeInput}
          setScopeInput={setScopeInput}
          showNotes={false}
        />
      )}
    </Modal>
  );
}
