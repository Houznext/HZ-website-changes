import { create } from "zustand";

interface SignUpState {
  email?: string;
  phone?: string;
  callbackUrl?: string;
  setRegisterState: (newState: Partial<SignUpState>) => void;
}

export const useRegisterUpStore = create<SignUpState>((set) => ({
  email: "",
  phone: "",
  callbackUrl: "",
  setRegisterState: (newState) => set((state) => ({ ...state, ...newState })),
}));
