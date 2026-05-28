import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { Modal } from './Modal';
import { Btn } from './Btn';
import { Label } from './Label';
import { FormInput } from './FormInput';
import { lbToast } from './Toast';
import livebuildApi from '../lib/api';
import type { CreateProjectPayload } from '../lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
};

export function NewProjectModal({ open, onClose, onCreated }: Props) {
  const [codePreview, setCodePreview] = useState('—');
  const [name, setName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('Enter mobile number and send OTP first');
  const [otpToken, setOtpToken] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);
  const [propertyType, setPropertyType] = useState('2BHK Apartment');
  const [projectType, setProjectType] = useState('Interior');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    livebuildApi
      .getNextProjectCode()
      .then((r) => setCodePreview(r.code))
      .catch(() => setCodePreview('HZLB-????'));
  }, [open]);

  const reset = () => {
    setName('');
    setCustomerName('');
    setPhone('');
    setOtp('');
    setOtpStatus('Enter mobile number and send OTP first');
    setOtpToken(undefined);
    setVerified(false);
    setStartDate('');
    setDueDate('');
    setAddress('');
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

  const create = async () => {
    if (!name.trim() || !customerName.trim() || !startDate || !dueDate) {
      lbToast('Fill required fields', 'err');
      return;
    }
    if (!verified) {
      lbToast('Verify customer mobile with OTP first', 'err');
      return;
    }
    setSubmitting(true);
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
      lbToast('Project created', 'ok');
      handleClose();
      onCreated(project.id);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to create project', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create new project"
      subtitle="Set up a new LiveBuild project"
      maxWidth={640}
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
        <>
          <Btn variant="blue" onClick={create} disabled={submitting}>
            Create project
          </Btn>
          <Btn variant="ghost" onClick={handleClose}>
            Cancel
          </Btn>
        </>
      }
    >
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
            <option>2BHK Apartment</option>
            <option>3BHK Apartment</option>
            <option>4BHK Villa</option>
            <option>1BHK Apartment</option>
            <option>Independent House</option>
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
    </Modal>
  );
}
