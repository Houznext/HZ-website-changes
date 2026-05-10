import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { useEnquiry } from '@/hooks/useEnquiry';

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

export function EnquiryPanel({ propertyId }: { propertyId: string }) {
  const { submit, loading } = useEnquiry();
  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: yupResolver(schema) as Resolver<Form>,
  });
  const [done, setDone] = useState(false);

  const onSubmit = async (data: Form) => {
    try {
      await submit({ ...data, propertyId });
      toast.success('Enquiry sent');
      setDone(true);
      reset();
    } catch {
      toast.error('Could not send enquiry');
    }
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-hzwhite p-5 shadow-lg">
      <div className="font-montserrat text-lg font-extrabold text-charcoal">Book a visit</div>
      <p className="mt-1 font-inter text-xs text-muted">We&apos;ll route this to CRM and a sales rep will call you.</p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" placeholder="Name" {...register('name')} />
        <input className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" placeholder="Phone" {...register('phone')} />
        <input className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" placeholder="Email (optional)" {...register('email')} />
        <textarea className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" rows={3} placeholder="Message" {...register('message')} />
        <Button variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Submit enquiry'}
        </Button>
      </form>
      {done && <p className="mt-2 font-inter text-xs text-hz-teal">Request logged.</p>}
    </div>
  );
}
