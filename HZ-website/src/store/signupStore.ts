import {create} from 'zustand';

interface SignUpState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  setSignUpState: (newState: Partial<SignUpState>) => void;
}

export const useSignUpStore = create<SignUpState>((set) => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  setSignUpState: (newState) => set((state) => ({ ...state, ...newState })),
}));
