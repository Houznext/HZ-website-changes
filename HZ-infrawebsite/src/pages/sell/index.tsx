import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { PROPERTY_TYPES, CITIES, LISTING_STATUS } from '@/lib/constants';
import api from '@/lib/axios';

const schema = yup.object({
  title: yup.string().required(),
  propertyType: yup.string().required(),
  listingFor: yup.string().oneOf(['Buy', 'Rent']).required(),
  constructionStatus: yup.string().required(),
  city: yup.string().required(),
  locality: yup.string().required(),
  basePrice: yup.number().required(),
});

type Form = yup.InferType<typeof schema>;

export default function SellPage() {
  const [step, setStep] = useState(0);
  const { register, handleSubmit, trigger, getValues } = useForm<Form>({
    resolver: yupResolver(schema),
    defaultValues: { listingFor: 'Buy', propertyType: 'Apartment', constructionStatus: 'Ready to Move' },
  });

  const next = async () => {
    const fields: (keyof Form)[][] = [['title', 'propertyType', 'listingFor'], ['city', 'locality', 'constructionStatus'], ['basePrice']];
    const ok = await trigger(fields[step]);
    if (ok) setStep((s) => Math.min(2, s + 1));
  };

  const submit = async () => {
    const v = getValues();
    try {
      await api.post('/properties', {
        title: v.title,
        propertyType: v.propertyType,
        listingFor: v.listingFor,
        constructionStatus: v.constructionStatus,
        city: v.city,
        locality: v.locality,
        basePrice: v.basePrice,
      });
      toast.success('Listing submitted for approval');
      setStep(0);
    } catch {
      toast.error('Submit failed — sign in if required');
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-lg px-4 py-10">
        <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">List property</h1>
        <p className="mt-1 font-inter text-sm text-muted">3 steps — goes to the approval queue.</p>
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded ${step >= i ? 'bg-hz-blue' : 'bg-border'}`} />
          ))}
        </div>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit(() => {
            void submit();
          })}
        >
          {step === 0 && (
            <>
              <input className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" placeholder="Title" {...register('title')} />
              <select className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" {...register('propertyType')}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" {...register('listingFor')}>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </>
          )}
          {step === 1 && (
            <>
              <select className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" {...register('city')}>
                <option value="">City</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" placeholder="Locality" {...register('locality')} />
              <select className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm" {...register('constructionStatus')}>
                {LISTING_STATUS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}
          {step === 2 && (
            <input
              type="number"
              className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
              placeholder="Expected price (INR)"
              {...register('basePrice')}
            />
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Back
              </Button>
            )}
            {step < 2 && (
              <Button type="button" variant="primary" onClick={() => void next()}>
                Next
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" variant="accent">
                Submit listing
              </Button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
