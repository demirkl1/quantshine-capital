// ── Auth & User Types ──────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isAdmin: boolean;
  isAdvisor: boolean;
  isInvestor: boolean;
  managedFundCode?: string;
  isAuthenticated: boolean;
}

// Backend /api/auth/login ve /api/users/me yanıtının (User entity) şekli.
// Token'lar artık gövdede DÖNMEZ; HttpOnly cookie'lerde taşınır.
export interface BackendUser {
  id?: number;
  keycloakId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string; // 'ADMIN' | 'ADVISOR' | 'INVESTOR'
  managedFundCode?: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: BackendUser) => void;
  logout: () => Promise<void>;
}

// ── Theme Types ────────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}
