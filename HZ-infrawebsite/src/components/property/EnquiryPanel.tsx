import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEnquiry } from '@/hooks/useEnquiry';
import type { PublicProperty } from '@/types/property.types';
import { estimateEMI, formatPriceInr, formatPSF, num, showEmiBlock } from '@/lib/property-utils';
import { EMIWidget } from '@/components/property/EMIWidget';
import { infraWhatsAppMeUrl } from '@/lib/infra-public-contact';

const schema = yup.object({
  name: yup.string().required(),
  phone: yup.string().required(),
  email: yup.string().email().notRequired(),
  message: yup.string().notRequired(),
});

type Form = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
};

export function EnquiryPanel({ property }: { property: PublicProperty }) {
  const { submit, loading } = useEnquiry();
  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: yupResolver(schema) as Resolver<Form>,
  });
  const [done, setDone] = useState(false);
  const principal = num(property.basePrice);
  const emi = showEmiBlock(property.propertyType) && principal ? estimateEMI(principal) : 0;
  const psfLine = formatPSF(
    property.basePrice,
    property.carpetArea || property.plotArea || property.landArea,
    property.areaUnit === 'sqyd' || property.areaUnit === 'sqyds' ? 'sqyd' : 'sqft',
  );

  const onSubmit = async (data: Form) => {
    try {
      await submit({ ...data, propertyId: property.propertyId });
      toast.success('Enquiry sent! Team will call within 2 hours ✓');
      setDone(true);
      reset();
    } catch {
      toast.error('Could not send enquiry');
    }
  };

  const wa = property.enableWhatsappEnquiry
    ? infraWhatsAppMeUrl(
        `Hi, I'm interested in ${property.title} (${property.propertyCode || property.propertyId})`,
        property.businessWhatsappE164,
      )
    : null;

  return (
    <div className="sticky top-[108px] flex flex-col gap-4">
      <div className="rounded-xl border border-[#dde8f5] bg-white p-5 shadow-sm">
        <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">Price</div>
        <div className="mt-1 font-montserrat text-3xl font-extrabold text-charcoal">{formatPriceInr(property.basePrice)}</div>
        {psfLine ? <div className="mt-1 font-inter text-xs text-muted">{psfLine}</div> : null}
        {num(property.totalCost) > num(property.basePrice) && (
          <div className="mt-2 font-inter text-xs text-muted">
            All-in cost:{' '}
            <strong className="text-[#0d9488]">{formatPriceInr(property.totalCost)}</strong>
          </div>
        )}
        {emi > 0 && (
          <p className="mt-2 font-inter text-[11px] text-muted">
            EMI from <strong className="text-charcoal">₹{emi.toLocaleString('en-IN')}/month</strong>
            <span className="text-muted"> (80% loan · 8.5% · 20yr)</span>
          </p>
        )}
      </div>

      {showEmiBlock(property.propertyType) && principal > 0 && (
        <div className="hidden rounded-xl border border-[#dde8f5] bg-white p-4 md:block">
          <EMIWidget principal={principal} />
        </div>
      )}

      <div className="rounded-xl border border-[#dde8f5] bg-white p-5 shadow-sm">
        <div className="font-montserrat text-sm font-bold text-charcoal">Send enquiry</div>
        <form className="mt-3 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <input
            className="w-full rounded-lg border border-[#dde8f5] px-3 py-2 font-inter text-sm transition duration-150 focus:border-[#2f80ed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
            placeholder="Your name"
            {...register('name')}
          />
          <input
            className="w-full rounded-lg border border-[#dde8f5] px-3 py-2 font-inter text-sm transition duration-150 focus:border-[#2f80ed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
            placeholder="+91 mobile number"
            type="tel"
            {...register('phone')}
          />
          <textarea
            className="w-full resize-none rounded-lg border border-[#dde8f5] px-3 py-2 font-inter text-sm transition duration-150 focus:border-[#2f80ed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
            rows={3}
            placeholder="I am interested in this property…"
            {...register('message')}
          />
          <Button variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send enquiry'}
          </Button>
        </form>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#25D366] bg-[#25D366]/10 py-2.5 font-montserrat text-sm font-bold text-[#128C7E] transition duration-150 hover:bg-[#25D366]/15"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
            WhatsApp
          </a>
        )}
        {done && <p className="mt-2 font-inter text-xs text-[#0d9488]">Request logged.</p>}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#dde8f5] bg-[#f5f7fa] px-3 py-2.5 font-inter text-xs text-muted">
        <span>
          Ref:{' '}
          <strong className="font-montserrat text-charcoal">{property.propertyCode || property.propertyId}</strong>
        </span>
        <button
          type="button"
          className="font-semibold text-[#2f80ed]"
          onClick={() => {
            void navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
            toast.success('Link copied');
          }}
        >
          Share ↗
        </button>
      </div>
    </div>
  );
}
