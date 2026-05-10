import { useState } from 'react';
import api from '@/lib/axios';

export function useEnquiry() {
  const [loading, setLoading] = useState(false);
  const submit = async (payload: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
    propertyId: string;
  }) => {
    setLoading(true);
    try {
      await api.post('/enquiries', payload);
      return true;
    } finally {
      setLoading(false);
    }
  };
  return { submit, loading };
}
