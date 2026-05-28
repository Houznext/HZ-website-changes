import { IndianState } from '@/src/utils/states';

export const indianStateOptions = Object.values(IndianState).map((state) => ({
  label: state,
  value: state,
}));
