'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { CITIES, PROPERTY_TYPES } from '@/lib/constants';
import { infraAdminPath } from '@/lib/infra-admin-url';
import api from '@/lib/axios';
import { uploadPropertyDocument, uploadPropertyPhoto } from '@/lib/upload';
import { formatPriceInr } from '@/lib/property-utils';

const BHK_OPTIONS = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK+', 'N/A (Land/Plot)'] as const;
const OWNERSHIP = ['Freehold', 'Leasehold'] as const;

const schema = yup.object({
  intent: yup.string().oneOf(['Buy', 'Rent']).required(),
  propertyType: yup.string().required(),
  city: yup.string().required(),
  locality: yup.string().required(),
  carpetArea: yup.number().positive().required(),
  basePrice: yup.number().positive().required(),
  bhkType: yup.string().required(),
  ownershipType: yup.string().required(),
  description: yup.string().default(''),
  ownerPhone: yup.string().min(10).required(),
});

type FormValues = yup.InferType<typeof schema>;

const STEPS = ['Property details', 'Photos & docs', 'Review & submit'] as const;

const AFTER_SUBMIT = [
  'Title verification',
  'EC check',
  'RERA compliance check',
  'Photography (Hyderabad)',
  'Listing published in 48 hrs',
  'Buyer enquiries managed',
] as const;

const labelClass =
  'mb-1.5 block font-montserrat text-[10px] font-bold uppercase tracking-[0.06em] text-muted';
const inputClass =
  'w-full rounded-lg border border-[#dde8f5] px-3 py-2.5 font-inter text-sm text-charcoal transition focus:border-[#2f80ed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]';

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center">
      {STEPS.map((label, i) => (
        <div key={label} className="contents">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-full font-montserrat text-xs font-extrabold',
                i < step && 'bg-[#0d9488] text-white',
                i === step && 'bg-hz-blue text-white',
                i > step && 'bg-[#dde8f5] text-muted',
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
            </div>
            <span
              className={clsx(
                'hidden font-montserrat text-xs font-bold sm:inline',
                i === step ? 'text-hz-blue' : 'font-medium text-muted',
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="mx-2 h-0.5 min-w-[12px] flex-1 bg-[#dde8f5] sm:mx-3" />
          )}
        </div>
      ))}
    </div>
  );
}

export function ListPropertyWizard() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [reraCertUrl, setReraCertUrl] = useState<string | null>(null);
  const [ecCertUrl, setEcCertUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, trigger, getValues, watch } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      intent: 'Buy',
      propertyType: 'Apartment',
      city: 'Hyderabad',
      bhkType: '2BHK',
      ownershipType: 'Freehold',
    },
  });

  const values = watch();

  const stepFields: (keyof FormValues)[][] = [
    ['intent', 'propertyType', 'city', 'locality', 'carpetArea', 'basePrice', 'bhkType', 'ownershipType', 'ownerPhone'],
    [],
    [],
  ];

  const goNext = async () => {
    const ok = await trigger(stepFields[step]);
    if (ok) setStep((s) => Math.min(2, s + 1));
  };

  const onUploadPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < Math.min(files.length, 8); i++) {
        urls.push(await uploadPropertyPhoto(files[i]!));
      }
      setPhotos((prev) => [...prev, ...urls].slice(0, 12));
      toast.success(`${urls.length} photo(s) uploaded`);
    } catch {
      toast.error('Photo upload failed — sign in or try again');
    } finally {
      setUploading(false);
    }
  };

  const onUploadDoc = async (file: File | null, kind: 'rera' | 'ec') => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPropertyDocument(file);
      if (kind === 'rera') setReraCertUrl(url);
      else setEcCertUrl(url);
      toast.success('Document uploaded');
    } catch {
      toast.error('Document upload failed — sign in or try again');
    } finally {
      setUploading(false);
    }
  };

  const buildTitle = (v: FormValues) => {
    const bhk = v.bhkType.startsWith('N/A') ? '' : `${v.bhkType} `;
    return `${bhk}${v.propertyType} — ${v.locality}`.trim();
  };

  const submit = async () => {
    const v = getValues();
    setSubmitting(true);
    try {
      await api.post('/properties', {
        title: buildTitle(v),
        propertyType: v.propertyType,
        listingFor: v.intent,
        constructionStatus: 'Ready to Move',
        city: v.city,
        locality: v.locality,
        carpetArea: v.carpetArea,
        basePrice: v.basePrice,
        bhkType: v.bhkType.startsWith('N/A') ? null : v.bhkType,
        description: v.description || undefined,
        ownerPhone: v.ownerPhone,
        photoUrls: photos.length ? photos : undefined,
        coverImageUrl: photos[0] ?? undefined,
        reraCertUrl: reraCertUrl ?? undefined,
        ecCertUrl: ecCertUrl ?? undefined,
        approvalStatus: 'pending',
        leadSource: 'website',
        listedBy: 'owner',
        internalNotes: `Ownership: ${v.ownershipType}`,
      });
      setSubmitted(true);
      toast.success('Listing submitted for Houznext review');
    } catch {
      toast.error('Submit failed — check your details or sign in and try again');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-10 text-center md:py-12">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#86efac] bg-[#dcfce7]">
          <Check className="h-7 w-7 text-[#16a34a]" strokeWidth={2} />
        </div>
        <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Listing submitted!</h1>
        <p className="mx-auto mt-3 max-w-md font-inter text-[13px] leading-relaxed text-muted md:text-sm">
          Your property is in the <strong className="text-charcoal">pending approval</strong> queue. Our team
          verifies title, EC, and RERA before it goes live on infra.houznext.com.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">
              Back to home
            </Button>
          </Link>
          <a href={infraAdminPath('/pending')} target="_blank" rel="noreferrer">
            <Button variant="ghost" className="w-full sm:w-auto">
              Open Infra Admin — approvals
            </Button>
          </a>
        </div>
        <p className="mt-6 font-inter text-[11px] text-muted">
          Ops team: review and approve in{' '}
          <a href={infraAdminPath('/pending')} className="font-semibold text-hz-blue hover:underline">
            Infra Admin → Pending approval
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 pb-12 pt-8 md:pt-10">
      <div className="mb-8 text-center">
        <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.12em] text-hz-teal">
          For sellers
        </div>
        <h1 className="mt-1.5 font-montserrat text-[26px] font-extrabold leading-tight text-charcoal md:text-[30px]">
          List your property
        </h1>
        <p className="mt-2 font-inter text-[13px] leading-relaxed text-muted md:text-sm">
          Submit your property for review. Our team verifies title, EC and RERA compliance before publishing.{' '}
          <strong className="text-[#0d9488]">Free listing.</strong>
        </p>
      </div>

      <StepIndicator step={step} />

      {step === 0 && (
        <div className="rounded-2xl border border-[#dde8f5] bg-white p-5 sm:p-7">
          <h2 className="mb-5 font-montserrat text-lg font-bold text-charcoal">Property details</h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className={labelClass}>I want to *</label>
              <select className={inputClass} {...register('intent')}>
                <option value="Buy">Sell</option>
                <option value="Rent">Rent out</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Property type *</label>
              <select className={inputClass} {...register('propertyType')}>
                {PROPERTY_TYPES.filter((t) => ['Apartment', 'Villa', 'Land', 'Plot'].includes(t)).map((t) => (
                  <option key={t} value={t}>
                    {t === 'Villa' ? 'Villa / Independent house' : t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <select className={inputClass} {...register('city')}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Locality *</label>
              <input
                className={inputClass}
                placeholder="e.g. Gachibowli, Kokapet…"
                {...register('locality')}
              />
            </div>
            <div>
              <label className={labelClass}>Carpet area (sqft) *</label>
              <input
                type="number"
                className={inputClass}
                placeholder="e.g. 1450"
                {...register('carpetArea', { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className={labelClass}>Expected price (₹) *</label>
              <input
                type="number"
                className={inputClass}
                placeholder="e.g. 6850000"
                {...register('basePrice', { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className={labelClass}>BHK type</label>
              <select className={inputClass} {...register('bhkType')}>
                {BHK_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ownership type *</label>
              <select className={inputClass} {...register('ownershipType')}>
                {OWNERSHIP.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Property description</label>
            <textarea
              rows={3}
              className={clsx(inputClass, 'resize-none')}
              placeholder="Describe your property (age, condition, amenities, nearby landmarks)…"
              {...register('description')}
            />
          </div>
          <div className="mt-4">
            <label className={labelClass}>Your contact number *</label>
            <input
              type="tel"
              className={inputClass}
              placeholder="+91 mobile number"
              {...register('ownerPhone')}
            />
          </div>

          <div className="mt-5 rounded-[10px] bg-offwhite p-3.5 sm:p-4">
            <div className="mb-2 font-montserrat text-xs font-bold text-charcoal">
              What Houznext Infra does after submission:
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {AFTER_SUBMIT.map((item) => (
                <div key={item} className="flex items-center gap-1.5 font-inter text-xs text-muted">
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#0d9488]" strokeWidth={2} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Button type="button" variant="primary" className="min-h-[44px] flex-1 justify-center" onClick={() => void goNext()}>
              Next: Photos &amp; docs →
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-[44px] justify-center px-5"
              onClick={() => toast.success('Draft saved locally')}
            >
              Save draft
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="rounded-2xl border border-[#dde8f5] bg-white p-5 sm:p-7">
          <h2 className="mb-5 font-montserrat text-lg font-bold text-charcoal">Photos &amp; documents</h2>
          <p className="mb-4 font-inter text-[13px] leading-relaxed text-muted">
            Add photos and optional RERA / EC documents. Uploads are stored securely and reviewed in Infra Admin
            before publish.
          </p>

          <label className={labelClass}>Property photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            className="mb-3 w-full font-inter text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-hz-blue-light file:px-3 file:py-2 file:font-montserrat file:text-xs file:font-bold file:text-hz-blue"
            onChange={(e) => void onUploadPhotos(e.target.files)}
          />
          {photos.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {photos.map((url) => (
                <div
                  key={url}
                  className="h-16 w-24 rounded-lg border border-[#dde8f5] bg-cover bg-center"
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>RERA certificate (optional)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                disabled={uploading}
                className="w-full font-inter text-sm text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-offwhite file:px-2 file:py-1.5 file:text-xs"
                onChange={(e) => void onUploadDoc(e.target.files?.[0] ?? null, 'rera')}
              />
            </div>
            <div>
              <label className={labelClass}>EC / title certificate (optional)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                disabled={uploading}
                className="w-full font-inter text-sm text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-offwhite file:px-2 file:py-1.5 file:text-xs"
                onChange={(e) => void onUploadDoc(e.target.files?.[0] ?? null, 'ec')}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button type="button" variant="ghost" className="min-h-[44px]" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button type="button" variant="primary" className="min-h-[44px] flex-1 justify-center" onClick={() => setStep(2)}>
              Next: Review &amp; submit →
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-[#dde8f5] bg-white p-5 sm:p-7">
          <h2 className="mb-5 font-montserrat text-lg font-bold text-charcoal">Review &amp; submit</h2>
          <dl className="space-y-2.5 font-inter text-[13px]">
            <div className="flex justify-between gap-4 border-b border-[#f0f4f8] py-2">
              <dt className="text-muted">Listing</dt>
              <dd className="text-right font-medium text-charcoal">
                {values.intent === 'Buy' ? 'Sell' : 'Rent out'} · {values.propertyType}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#f0f4f8] py-2">
              <dt className="text-muted">Location</dt>
              <dd className="text-right font-medium text-charcoal">
                {values.locality}, {values.city}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#f0f4f8] py-2">
              <dt className="text-muted">Area / price</dt>
              <dd className="text-right font-medium text-charcoal">
                {values.carpetArea ? `${values.carpetArea} sqft` : '—'} ·{' '}
                {values.basePrice ? formatPriceInr(values.basePrice) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#f0f4f8] py-2">
              <dt className="text-muted">Photos</dt>
              <dd className="font-medium text-charcoal">{photos.length} uploaded</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted">Contact</dt>
              <dd className="font-medium text-charcoal">{values.ownerPhone || '—'}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg bg-offwhite px-3 py-2.5 font-inter text-[12px] leading-relaxed text-muted">
            Submissions appear in{' '}
            <a href={infraAdminPath('/pending')} className="font-semibold text-hz-blue hover:underline">
              Infra Admin → Pending approval
            </a>{' '}
            for the ops team to verify and publish.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button type="button" variant="ghost" className="min-h-[44px]" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              type="button"
              variant="accent"
              className="min-h-[44px] flex-1 justify-center"
              disabled={submitting}
              onClick={() => void handleSubmit(() => submit())()}
            >
              {submitting ? 'Submitting…' : 'Submit listing for review'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
