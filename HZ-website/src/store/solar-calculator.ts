import {create} from "zustand";

type SolarCalculatorStore = {
  monthlyBill: number;
  setMonthlyBill: (value: number) => void;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
};

export const useSolarCalculatorStore = create<SolarCalculatorStore>((set) => ({
  monthlyBill: 0,
  setMonthlyBill: (value: number) => set({ monthlyBill: value }),

  openModal: false,
  setOpenModal: (value: boolean) => set({ openModal: value }),
}));
