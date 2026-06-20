import { api } from "./api";
import type { Session } from "../types";

export const authService = {
  async me() {
    const { data } = await api.get<Session>("/auth/me/");
    return data;
  },
  async login(payload: { username: string; password: string; remember?: boolean }) {
    const { data } = await api.post<Session>("/auth/login/", payload);
    return data;
  },
  async register(payload: { first_name: string; last_name: string; email: string; phone?: string; password: string }) {
    const { data } = await api.post<Session>("/auth/register/", payload);
    return data;
  },
  async logout() {
    const { data } = await api.post<Session>("/auth/logout/");
    return data;
  },
};
