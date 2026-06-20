import { create } from "zustand";
import type { Session } from "../types";

type AuthState = {
  session: Session;
  setSession: (session: Session) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: { authenticated: false, user: null },
  setSession: (session) => set({ session }),
}));
